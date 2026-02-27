#!/usr/bin/env node
/**
 * lh-scan.mjs — Lighthouse audit (Performance · Accessibility · Best-Practices · SEO)
 *
 * Uses the Lighthouse CLI so chrome-launcher resolves within lighthouse's own
 * dependency graph, avoiding pnpm hoisting issues.
 *
 * Usage:
 *   node lh-scan.mjs <url> [desktop|mobile]
 *
 * Examples:
 *   node lh-scan.mjs http://localhost:5173
 *   node lh-scan.mjs http://localhost:5173 mobile
 *
 * Output: compact JSON to stdout — parse in the skill, do not pipe to humans directly.
 *
 * Note: Lighthouse requires an HTTP/HTTPS URL. file:// is not supported.
 */

import { execFileSync } from "node:child_process";
import { resolve, join } from "node:path";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const __dir = fileURLToPath(new URL(".", import.meta.url));
// scripts/ → performance-check/ → skills/ → .claude/ → project root
const projectRoot = resolve(__dir, "../../../..");

const url = process.argv[2] ?? "http://localhost:5173";
const formFactor = process.argv[3] === "mobile" ? "mobile" : "desktop";
const force = process.argv.includes("--force");

const LH_RESULT_PATH = ".audit/lh-result.json";
const LH_STATUS_PATH = ".audit/lh-status.json";

if (url.startsWith("file://")) {
  process.stderr.write(
    "[lh-scan] Lighthouse does not support file:// URLs. Start pnpm dev and use http://localhost:5173 instead.\n"
  );
  process.exit(1);
}

// Resume: if a valid cached result exists (and --force not passed), output it and skip re-running
if (!force && existsSync(LH_RESULT_PATH)) {
  try {
    const cached = readFileSync(LH_RESULT_PATH, "utf8");
    JSON.parse(cached); // validate — throws if malformed
    process.stderr.write(
      "[lh-scan] Using cached result. Pass --force to re-run Lighthouse.\n"
    );
    process.stdout.write(cached);
    process.exit(0);
  } catch {
    // malformed cache — fall through to fresh run
  }
}

// Write a status marker before starting so failures are detectable
writeFileSync(
  LH_STATUS_PATH,
  JSON.stringify({
    status: "running",
    startedAt: new Date().toISOString(),
    url,
    formFactor,
  })
);
process.stderr.write(
  `[lh-scan] Starting Lighthouse (${formFactor}) → ${url}\n`
);

// Resolve lighthouse CLI — prefer .CMD on Windows (shell scripts are not directly executable)
const candidates =
  process.platform === "win32"
    ? [
        join(projectRoot, "node_modules", ".bin", "lighthouse.CMD"),
        join(projectRoot, "node_modules", ".bin", "lighthouse"),
      ]
    : [join(projectRoot, "node_modules", ".bin", "lighthouse")];
const lhBin =
  candidates.find(existsSync) ??
  join(projectRoot, "node_modules", ".bin", "lighthouse.CMD");

const lhArgs = [
  url,
  "--output=json",
  "--output-path=stdout",
  "--quiet",
  "--chrome-flags=--headless=new --no-sandbox --disable-gpu",
  "--only-categories=performance,accessibility,best-practices,seo",
  `--preset=${formFactor}`,
];

let raw;
try {
  raw = execFileSync(lhBin, lhArgs, {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    cwd: projectRoot,
    // Lighthouse writes progress to stderr — suppress it
    stdio: ["ignore", "pipe", "ignore"],
    // .CMD files on Windows require a shell to execute
    shell: process.platform === "win32",
  });
} catch (err) {
  // execFileSync throws on non-zero exit but stdout may still hold valid JSON
  raw = err.stdout ?? "";
  if (!raw.trim()) {
    process.stderr.write(`[lh-scan] Lighthouse failed: ${err.message}\n`);
    process.exit(1);
  }
}

const lhr = JSON.parse(raw);

const scores = Object.fromEntries(
  Object.entries(lhr.categories).map(([k, v]) => [
    k,
    v.score !== null ? Math.round(v.score * 100) : null,
  ])
);

// Map each audit ID to its parent category for grouping in the report
const auditToCategory = {};
for (const [key, cat] of Object.entries(lhr.categories)) {
  for (const ref of cat.auditRefs ?? []) {
    auditToCategory[ref.id] = key;
  }
}

// Top failing audits — exclude informational / not-applicable / manual
const SKIP_MODES = new Set(["informative", "notApplicable", "manual"]);
const topIssues = Object.values(lhr.audits)
  .filter(
    (a) =>
      a.score !== null && a.score < 1 && !SKIP_MODES.has(a.scoreDisplayMode)
  )
  .sort((a, b) => (a.score ?? 0) - (b.score ?? 0))
  .slice(0, 20)
  .map((a) => ({
    id: a.id,
    category: auditToCategory[a.id] ?? "other",
    title: a.title,
    score: Math.round((a.score ?? 0) * 100),
    displayValue: a.displayValue ?? null,
    description: a.description
      ? a.description.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").slice(0, 120)
      : null,
  }));

// Opportunity metrics (only from performance category)
const opportunities = Object.values(lhr.audits)
  .filter(
    (a) => a.details?.type === "opportunity" && a.details.overallSavingsMs > 100
  )
  .sort((a, b) => b.details.overallSavingsMs - a.details.overallSavingsMs)
  .slice(0, 8)
  .map((a) => ({
    id: a.id,
    title: a.title,
    savingsMs: Math.round(a.details.overallSavingsMs),
    displayValue: a.displayValue ?? null,
  }));

// --- Findings document (no slice limits, full details for downstream agents) ---
const allIssues = Object.values(lhr.audits)
  .filter(
    (a) =>
      a.score !== null && a.score < 1 && !SKIP_MODES.has(a.scoreDisplayMode)
  )
  .sort((a, b) => (a.score ?? 0) - (b.score ?? 0))
  .map((a) => ({
    id: a.id,
    category: auditToCategory[a.id] ?? "other",
    title: a.title,
    score: Math.round((a.score ?? 0) * 100),
    displayValue: a.displayValue ?? null,
    description: a.description?.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") ?? null,
    details: a.details ?? null,
  }));

const allOpportunities = Object.values(lhr.audits)
  .filter(
    (a) => a.details?.type === "opportunity" && a.details.overallSavingsMs > 0
  )
  .sort((a, b) => b.details.overallSavingsMs - a.details.overallSavingsMs)
  .map((a) => ({
    id: a.id,
    title: a.title,
    savingsMs: Math.round(a.details.overallSavingsMs),
    displayValue: a.displayValue ?? null,
    details: a.details,
  }));

const passingAudits = Object.values(lhr.audits)
  .filter((a) => a.score === 1)
  .map((a) => ({
    id: a.id,
    category: auditToCategory[a.id] ?? "other",
    title: a.title,
  }));

writeFileSync(
  ".audit/lh-findings.json",
  JSON.stringify(
    {
      completedAt: new Date().toISOString(),
      url,
      formFactor,
      fetchTime: lhr.fetchTime,
      scores,
      allIssues,
      allOpportunities,
      passingAudits,
    },
    null,
    2
  )
);
writeFileSync(
  LH_STATUS_PATH,
  JSON.stringify({
    status: "done",
    completedAt: new Date().toISOString(),
    url,
    formFactor,
  })
);
process.stderr.write(
  `[lh-scan] Findings written to .audit/lh-findings.json (${allIssues.length} issues, ${allOpportunities.length} opportunities)\n`
);

process.stdout.write(
  JSON.stringify(
    {
      url,
      formFactor,
      fetchTime: lhr.fetchTime,
      scores,
      topIssues,
      opportunities,
    },
    null,
    2
  )
);
