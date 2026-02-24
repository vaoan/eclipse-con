#!/usr/bin/env node
/**
 * Updates VITE_APP_VERSION in .env.development to a timestamp+git-hash.
 * Runs safely in pre-commit to help confirm which build is deployed.
 */
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ENV_PATH = resolve(".env.development");

function getShortHash() {
  try {
    return execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
  } catch {
    return "nohash";
  }
}

function formatVersion() {
  const iso = new Date().toISOString().replace(/[:.]/g, "");
  const hash = getShortHash();
  return `${iso}-${hash}`;
}

function updateEnvFile() {
  const version = formatVersion();
  const raw = readFileSync(ENV_PATH, "utf8");
  const lines = raw.split("\n");
  const targetKey = "VITE_APP_VERSION";
  let found = false;

  const next = lines.map((line) => {
    if (line.startsWith(`${targetKey}=`)) {
      found = true;
      return `${targetKey}="${version}"`;
    }
    return line;
  });

  if (!found) {
    next.push(`${targetKey}="${version}"`);
  }

  writeFileSync(ENV_PATH, next.join("\n"), "utf8");
  console.log(`Updated ${targetKey}=${version}`);
}

updateEnvFile();
