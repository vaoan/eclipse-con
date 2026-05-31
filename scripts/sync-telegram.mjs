import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

function runNodeScript(scriptName, args = []) {
  const scriptPath = resolve(process.cwd(), "scripts", scriptName);
  const result = spawnSync(process.execPath, [scriptPath, ...args], {
    stdio: "inherit",
    env: process.env,
    shell: false,
  });

  if (result.error) {
    console.error(
      `[sync-telegram] Failed to start ${scriptName}: ${result.error.message}`
    );
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const deployArgs = process.argv.slice(2);
const normalizedDeployArgs =
  deployArgs[0] === "--" ? deployArgs.slice(1) : deployArgs;

runNodeScript("fetch-telegram.mjs");
runNodeScript("translate-telegram.mjs");
runNodeScript("build.mjs");
runNodeScript("deploy-cloudflare.mjs", normalizedDeployArgs);
