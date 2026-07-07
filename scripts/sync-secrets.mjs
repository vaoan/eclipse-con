#!/usr/bin/env node
/**
 * Sync secrets from GitHub repository secrets to the local .secrets file.
 *
 * GitHub Actions secrets are write-only, so this does a secure round-trip:
 *   1. Generate a random one-time passphrase
 *   2. Trigger the sync-secrets.yml workflow via `gh workflow run`
 *   3. Poll for workflow completion (120s timeout)
 *   4. Download the encrypted artifact
 *   5. Decrypt with the passphrase and write .secrets
 *   6. Clean up the encrypted artifact
 *
 * Prerequisites:
 *   - `gh` CLI installed and authenticated (`gh auth status`)
 *   - Repository access with workflow dispatch permissions
 *
 * Usage:
 *   pnpm sync:secrets
 */
import { createDecipheriv, pbkdf2Sync, randomBytes } from "node:crypto";
import {
  existsSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
  rmSync,
} from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");
const secretsPath = resolve(rootDir, ".secrets");

const WORKFLOW_FILE = "sync-secrets.yml";
const ARTIFACT_NAME = "secrets-encrypted";
const POLL_INTERVAL_MS = 5_000;
const TIMEOUT_MS = 120_000;

// ── Helpers ─────────────────────────────────────────────────────

/** Log a namespaced progress line. */
function log(msg) {
  console.log(`[sync-secrets] ${msg}`);
}

/** Print an error and exit non-zero. */
function fail(msg) {
  console.error(`[sync-secrets] ${msg}`);
  process.exit(1);
}

/** Run a `gh` CLI command from the repo root and return the spawn result. */
function gh(args, opts = {}) {
  return spawnSync("gh", args, { cwd: rootDir, encoding: "utf8", ...opts });
}

/** Fail fast unless the GitHub CLI is installed and authenticated. */
function ensureGhCli() {
  const result = gh(["auth", "status"]);
  if (result.status !== 0) {
    fail(
      "GitHub CLI (gh) is not installed or not authenticated.\n" +
        "Install it from https://cli.github.com and run `gh auth login`."
    );
  }
}

/** Resolve the current repo's `owner/name` slug via `gh`. */
function getRepoSlug() {
  const result = gh([
    "repo",
    "view",
    "--json",
    "nameWithOwner",
    "-q",
    ".nameWithOwner",
  ]);
  if (result.status !== 0 || !result.stdout.trim()) {
    fail("Could not determine repository. Make sure you're in a GitHub repo.");
  }
  return result.stdout.trim();
}

/** Current git branch, defaulting to `main`. */
function getCurrentBranch() {
  const result = spawnSync("git", ["branch", "--show-current"], {
    cwd: rootDir,
    encoding: "utf8",
  });
  return result.stdout?.trim() || "main";
}

/** Dispatch the sync-secrets workflow with the one-time passphrase. */
function triggerWorkflow(passphrase) {
  log("Triggering sync-secrets workflow...");
  const branch = getCurrentBranch();
  log(`Using branch: ${branch}`);
  const result = gh([
    "workflow",
    "run",
    WORKFLOW_FILE,
    "--ref",
    branch,
    "--field",
    `passphrase=${passphrase}`,
  ]);
  if (result.status !== 0) {
    fail(`Failed to trigger workflow: ${result.stderr || "unknown error"}`);
  }
}

/** Sleep for `ms` milliseconds. */
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Poll the latest workflow run until it completes; return its database id. */
async function waitForRun() {
  log("Waiting for workflow to complete...");
  const startedAt = Date.now();

  // Give GitHub a moment to register the run
  await sleep(3_000);

  while (Date.now() - startedAt < TIMEOUT_MS) {
    const result = gh([
      "run",
      "list",
      "--workflow",
      WORKFLOW_FILE,
      "--limit",
      "1",
      "--json",
      "databaseId,status,conclusion",
    ]);

    if (result.status === 0 && result.stdout.trim()) {
      try {
        const runs = JSON.parse(result.stdout.trim());
        if (runs.length > 0) {
          const run = runs[0];
          if (run.status === "completed") {
            if (run.conclusion === "success") {
              log(`Workflow completed successfully (run ${run.databaseId}).`);
              return run.databaseId;
            }
            fail(
              `Workflow failed with conclusion: ${run.conclusion}. ` +
                `Check the run at: gh run view ${run.databaseId}`
            );
          }
          const elapsed = Math.round((Date.now() - startedAt) / 1000);
          process.stdout.write(
            `\r[sync-secrets] Workflow ${run.status}... (${elapsed}s)`
          );
        }
      } catch {
        // JSON parse error, retry
      }
    }

    await sleep(POLL_INTERVAL_MS);
  }

  fail(
    `Secrets workflow timed out after ${TIMEOUT_MS / 1000}s. ` +
      `Check the runs at: gh run list --workflow ${WORKFLOW_FILE}`
  );
}

/** Download the encrypted artifact for a run into a temp dir. */
function downloadArtifact(runId) {
  log("Downloading encrypted artifact...");
  const downloadDir = resolve(rootDir, ".secrets-download");

  if (existsSync(downloadDir)) {
    rmSync(downloadDir, { recursive: true, force: true });
  }

  const result = gh([
    "run",
    "download",
    String(runId),
    "--name",
    ARTIFACT_NAME,
    "--dir",
    downloadDir,
  ]);

  if (result.status !== 0) {
    fail(`Failed to download artifact: ${result.stderr || "unknown error"}`);
  }

  const encryptedPath = resolve(downloadDir, "secrets-encrypted.bin");
  if (!existsSync(encryptedPath)) {
    rmSync(downloadDir, { recursive: true, force: true });
    fail("Downloaded artifact does not contain secrets-encrypted.bin.");
  }

  return { encryptedPath, downloadDir };
}

/** Decrypt the OpenSSL-salted artifact and write it to `.secrets`; returns the key count. */
function decryptAndWrite(encryptedPath, passphrase, downloadDir) {
  log("Decrypting secrets...");
  const decryptedPath = resolve(rootDir, ".secrets-decrypted.tmp");

  try {
    const encrypted = readFileSync(encryptedPath);
    const magic = encrypted.subarray(0, 8).toString("ascii");
    if (magic !== "Salted__") {
      throw new Error("encrypted artifact is not in OpenSSL salted format");
    }

    const salt = encrypted.subarray(8, 16);
    const ciphertext = encrypted.subarray(16);
    const keyAndIv = pbkdf2Sync(passphrase, salt, 10_000, 48, "sha256");
    const key = keyAndIv.subarray(0, 32);
    const iv = keyAndIv.subarray(32, 48);
    const decipher = createDecipheriv("aes-256-cbc", key, iv);
    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);
    writeFileSync(decryptedPath, decrypted);
  } catch (err) {
    rmSync(downloadDir, { recursive: true, force: true });
    if (existsSync(decryptedPath)) unlinkSync(decryptedPath);
    fail(`Failed to decrypt secrets artifact: ${err.message}`);
  }

  rmSync(downloadDir, { recursive: true, force: true });

  const content = readFileSync(decryptedPath, "utf-8");
  writeFileSync(secretsPath, content, "utf-8");
  unlinkSync(decryptedPath);

  return content.split("\n").filter((line) => {
    const trimmed = line.trim();
    return trimmed && !trimmed.startsWith("#") && trimmed.includes("=");
  }).length;
}

// ── Main ────────────────────────────────────────────────────────

/** Orchestrate the full trigger → download → decrypt round-trip. */
async function main() {
  ensureGhCli();

  const repoSlug = getRepoSlug();
  log(`Repository: ${repoSlug}`);

  const passphrase = randomBytes(32).toString("hex");

  triggerWorkflow(passphrase);
  const runId = await waitForRun();
  const { encryptedPath, downloadDir } = downloadArtifact(runId);
  const secretCount = decryptAndWrite(encryptedPath, passphrase, downloadDir);

  console.log("");
  log(`✓ Synced ${secretCount} secrets to .secrets`);
}

main().catch((err) => {
  console.error(`[sync-secrets] ${err.message}`);
  process.exit(1);
});
