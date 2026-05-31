import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

function runNode(scriptPath, args = []) {
  const result = spawnSync(process.execPath, [scriptPath, ...args], {
    stdio: "inherit",
    env: process.env,
    shell: false,
  });

  if (result.error) {
    console.error(
      `[build] Failed to start ${scriptPath}: ${result.error.message}`
    );
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function runBin(binPath, args = []) {
  const result = spawnSync(process.execPath, [binPath, ...args], {
    stdio: "inherit",
    env: process.env,
    shell: false,
  });

  if (result.error) {
    console.error(
      `[build] Failed to start ${binPath}: ${result.error.message}`
    );
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const root = process.cwd();

runBin(resolve(root, "node_modules", "typescript", "bin", "tsc"), ["-b"]);
runBin(resolve(root, "node_modules", "vite", "bin", "vite.js"), ["build"]);
runNode(resolve(root, "scripts", "copy-cloudflare-headers.mjs"));
