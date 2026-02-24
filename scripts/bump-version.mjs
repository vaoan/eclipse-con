#!/usr/bin/env node
/**
 * Updates VITE_APP_VERSION in .env.development to an incrementing number.
 * Runs in pre-commit to help confirm which build is deployed.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ENV_PATH = resolve(".env.development");

function getNextVersion(rawEnv) {
  const match = rawEnv.match(/^VITE_APP_VERSION=["']?([0-9]+)["']?/m);
  const current = match ? Number.parseInt(match[1], 10) : 0;
  if (Number.isNaN(current)) {
    return 1;
  }
  return current + 1;
}

function updateEnvFile() {
  const raw = readFileSync(ENV_PATH, "utf8");
  const nextVersion = getNextVersion(raw);
  const lines = raw.split("\n");
  const targetKey = "VITE_APP_VERSION";
  let found = false;

  const next = lines.map((line) => {
    if (line.startsWith(`${targetKey}=`)) {
      found = true;
      return `${targetKey}="${nextVersion}"`;
    }
    return line;
  });

  if (!found) {
    next.push(`${targetKey}="${nextVersion}"`);
  }

  writeFileSync(ENV_PATH, next.join("\n"), "utf8");
  console.log(`Updated ${targetKey}=${nextVersion}`);
}

updateEnvFile();
