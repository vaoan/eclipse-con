#!/usr/bin/env node
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const VALID_ENVS = new Set(["production", "staging"]);
const PROJECT_ENV_PREFIXES = [
  "VITE_",
  "TELEGRAM_",
  "TRANSLATE_",
  "AZURE_",
  "OPENAI_",
];
const PROJECT_ENV_EXACT_KEYS = new Set(["PLAYWRIGHT_BASE_URL"]);
const LOCAL_ONLY_RUNTIME_KEYS = new Set(["PLAYWRIGHT_BASE_URL"]);

function parseArgs(argv) {
  const options = {
    env: "production",
    remote: "origin",
    commitMessage: "",
    dryRun: false,
    skipCommit: false,
    skipPush: false,
    help: false,
  };

  for (const argument of argv) {
    if (argument === "--dry-run") {
      options.dryRun = true;
      continue;
    }

    if (argument === "--skip-commit") {
      options.skipCommit = true;
      continue;
    }

    if (argument === "--skip-push") {
      options.skipPush = true;
      continue;
    }

    if (argument === "--help" || argument === "-h") {
      options.help = true;
      continue;
    }

    if (argument.startsWith("--env=")) {
      options.env = argument.slice("--env=".length).trim() || "production";
      continue;
    }

    if (argument.startsWith("--remote=")) {
      options.remote = argument.slice("--remote=".length).trim() || "origin";
      continue;
    }

    if (argument.startsWith("--message=")) {
      options.commitMessage = argument.slice("--message=".length).trim();
      continue;
    }

    throw new Error(`Unknown argument: ${argument}`);
  }

  if (!VALID_ENVS.has(options.env)) {
    throw new Error(
      `Invalid --env value "${options.env}". Use "production" or "staging".`
    );
  }

  return options;
}

function printHelp() {
  console.log(`Usage: pnpm release [--env=production|staging] [options]

Options:
  --dry-run        Run validation and Cloudflare dry-run without git mutations or deploy
  --skip-commit    Do not auto-commit local changes before release
  --skip-push      Do not push the current branch before release
  --remote=name    Git remote to push to (default: origin)
  --message=text   Commit message to use when auto-committing changes
  --help, -h       Show this help message
`);
}

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return {};
  }

  const content = readFileSync(filePath, "utf8");
  const entries = {};

  for (const line of content.split(/\r?\n/u)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex < 1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    entries[key] = value;
  }

  return entries;
}

function getEnvFileCandidates(envName) {
  const candidates = [resolve(".env.example"), resolve(".env.local")];

  if (envName === "production") {
    candidates.push(resolve(".env.production"));
    candidates.push(resolve(".env.production.local"));
  }

  if (envName === "staging") {
    candidates.push(resolve(".env.staging"));
    candidates.push(resolve(".env.staging.local"));
  }

  return candidates;
}

function getProjectEnvKeys(fileEntries, mergedProcessEnv) {
  const keys = new Set(Object.keys(fileEntries));

  for (const key of Object.keys(mergedProcessEnv)) {
    if (
      PROJECT_ENV_EXACT_KEYS.has(key) ||
      PROJECT_ENV_PREFIXES.some((prefix) => key.startsWith(prefix))
    ) {
      keys.add(key);
    }
  }

  return keys;
}

function buildReleaseEnv(envName) {
  const fileEntries = {};

  for (const filePath of getEnvFileCandidates(envName)) {
    Object.assign(fileEntries, parseEnvFile(filePath));
  }

  const mergedEnv = {
    ...fileEntries,
    ...process.env,
  };

  return {
    mergedEnv,
    projectEnvKeys: getProjectEnvKeys(fileEntries, mergedEnv),
  };
}

function splitRuntimeBindings(mergedEnv, projectEnvKeys) {
  const vars = {};
  const secrets = {};

  for (const key of projectEnvKeys) {
    const value = mergedEnv[key];

    if (typeof value !== "string" || value.length === 0) {
      continue;
    }

    if (LOCAL_ONLY_RUNTIME_KEYS.has(key)) {
      continue;
    }

    if (key.startsWith("VITE_")) {
      vars[key] = value;
      continue;
    }

    secrets[key] = value;
  }

  return { vars, secrets };
}

function createSecretsFile(secrets) {
  const keys = Object.keys(secrets);

  if (keys.length === 0) {
    return null;
  }

  const directory = mkdtempSync(resolve(tmpdir(), "eclipse-con-release-"));
  const filePath = resolve(directory, "wrangler-secrets.env");
  const content = keys
    .sort()
    .map((key) => `${key}=${JSON.stringify(secrets[key])}`)
    .join("\n");

  writeFileSync(filePath, `${content}\n`, "utf8");
  return { directory, filePath };
}

function cleanupSecretsFile(tempSecretsFile) {
  if (!tempSecretsFile) {
    return;
  }

  rmSync(tempSecretsFile.directory, { recursive: true, force: true });
}

function formatEnvNameForWrangler(envName) {
  return envName === "production" ? "" : envName;
}

function buildWranglerDeployArgs({ dryRun, envName, vars, secretsFilePath }) {
  const args = [
    "exec",
    "wrangler",
    "deploy",
    "--env",
    formatEnvNameForWrangler(envName),
  ];

  for (const [key, value] of Object.entries(vars).sort(([left], [right]) =>
    left.localeCompare(right)
  )) {
    args.push("--var", `${key}:${value}`);
  }

  if (Object.keys(vars).length > 0) {
    args.push("--keep-vars=true");
  }

  if (secretsFilePath) {
    args.push("--secrets-file", secretsFilePath);
  }

  if (dryRun) {
    args.push("--dry-run");
  }

  return args;
}

function summarizeKeys(label, values) {
  const keys = Object.keys(values).sort();
  console.log(
    `[release] ${label}: ${keys.length > 0 ? keys.join(", ") : "(none)"}`
  );
}

function runWranglerDeploy({ dryRun, envName, env, vars, secretsFilePath }) {
  const args = buildWranglerDeployArgs({
    dryRun,
    envName,
    vars,
    secretsFilePath,
  });

  runCommand("pnpm", args, { env });
}

function buildReleaseContext(envName) {
  const { mergedEnv, projectEnvKeys } = buildReleaseEnv(envName);
  const runtimeBindings = splitRuntimeBindings(mergedEnv, projectEnvKeys);

  return {
    mergedEnv,
    projectEnvKeys,
    runtimeBindings,
  };
}

function getShellCommand(binary, args) {
  if (process.platform === "win32") {
    return ["cmd.exe", ["/c", binary, ...args]];
  }

  return [binary, args];
}

function runCommand(binary, args, options = {}) {
  const [command, commandArgs] = getShellCommand(binary, args);
  const result = spawnSync(command, commandArgs, {
    stdio: options.captureOutput ? "pipe" : "inherit",
    cwd: resolve("."),
    env: options.env ?? process.env,
    encoding: "utf8",
  });

  if (result.error) {
    throw result.error;
  }

  if ((result.status ?? 1) !== 0) {
    throw new Error(
      `${binary} ${args.join(" ")} failed with exit code ${result.status ?? 1}.`
    );
  }

  return options.captureOutput ? result.stdout.trim() : "";
}

function logStep(message) {
  console.log(`\n[release] ${message}`);
}

function getCurrentBranch(env) {
  return runCommand("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
    env,
    captureOutput: true,
  });
}

function getGitStatus(env) {
  return runCommand("git", ["status", "--short"], {
    env,
    captureOutput: true,
  });
}

function runPnpmScript(scriptName, env) {
  runCommand("pnpm", [scriptName], { env });
}

function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printHelp();
    return;
  }

  const releaseContext = buildReleaseContext(options.env);
  const releaseEnv = releaseContext.mergedEnv;
  const branch = getCurrentBranch(releaseEnv);

  if (branch === "HEAD") {
    throw new Error("Release aborted: detached HEAD is not supported.");
  }

  const dirtyStatus = getGitStatus(releaseEnv);
  const hasLocalChanges = dirtyStatus.length > 0;
  const commitMessage =
    options.commitMessage || `chore: release ${options.env}`;

  logStep(`Target environment: ${options.env}`);
  logStep(`Current branch: ${branch}`);
  summarizeKeys("Cloudflare runtime vars", releaseContext.runtimeBindings.vars);
  summarizeKeys(
    "Cloudflare runtime secrets",
    releaseContext.runtimeBindings.secrets
  );

  if (hasLocalChanges) {
    logStep("Detected local changes.");

    if (options.skipCommit || options.dryRun) {
      logStep("Skipping auto-commit due to flags.");
    } else {
      runCommand("git", ["add", "-A"], { env: releaseEnv });
      runCommand("git", ["commit", "-m", commitMessage], { env: releaseEnv });
    }
  } else {
    logStep("Working tree is clean.");
  }

  logStep("Running release validation.");
  runPnpmScript("typecheck", releaseEnv);
  runPnpmScript("lint", releaseEnv);

  if (options.env === "staging") {
    runPnpmScript("test:e2e:routing", releaseEnv);
  }

  runPnpmScript("build", releaseEnv);
  const tempSecretsFile = createSecretsFile(
    releaseContext.runtimeBindings.secrets
  );

  try {
    runWranglerDeploy({
      dryRun: true,
      envName: options.env,
      env: releaseEnv,
      vars: releaseContext.runtimeBindings.vars,
      secretsFilePath: tempSecretsFile?.filePath ?? null,
    });

    if (options.dryRun) {
      logStep("Dry run complete. Skipping push and live deploy.");
      return;
    }

    if (!options.skipPush) {
      logStep(`Pushing ${branch} to ${options.remote}.`);
      runCommand("git", ["push", options.remote, branch], { env: releaseEnv });
    } else {
      logStep("Skipping git push due to flag.");
    }

    logStep("Deploying to Cloudflare.");
    runWranglerDeploy({
      dryRun: false,
      envName: options.env,
      env: releaseEnv,
      vars: releaseContext.runtimeBindings.vars,
      secretsFilePath: tempSecretsFile?.filePath ?? null,
    });

    if (options.env === "staging") {
      runPnpmScript("test:e2e:staging", releaseEnv);
    }

    logStep("Release complete.");
  } finally {
    cleanupSecretsFile(tempSecretsFile);
  }
}

try {
  main();
} catch (error) {
  console.error(
    `\n[release] ${error instanceof Error ? error.message : String(error)}`
  );
  process.exit(1);
}
