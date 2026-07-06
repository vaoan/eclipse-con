import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const previewPort = "4173";
const chromePort = "9222";
const profileDir = resolve(".lh-profile");

if (!existsSync(chromePath)) {
  console.error(`[lighthouse] Chrome not found at: ${chromePath}`);
  process.exit(1);
}

const preview = spawn("pnpm", ["preview", "--", "--port", previewPort], {
  stdio: "inherit",
  shell: true,
});

const chromeArgs = [
  "--headless=new",
  `--remote-debugging-port=${chromePort}`,
  `--user-data-dir=${profileDir}`,
  "--disable-gpu",
  "--no-first-run",
  "--no-default-browser-check",
];

const chrome = spawn(chromePath, chromeArgs, { stdio: "ignore" });

const cleanup = (code = 0) => {
  if (!chrome.killed) {
    chrome.kill("SIGTERM");
  }
  if (!preview.killed) {
    preview.kill("SIGTERM");
  }
  process.exit(code);
};

const run = async () => {
  await new Promise((resolveDelay) => setTimeout(resolveDelay, 8000));
  const lighthouse = spawn(
    "pnpm",
    [
      "exec",
      "lighthouse",
      `http://localhost:${previewPort}`,
      "--port",
      chromePort,
      "--output=html",
      "--output=json",
      "--output-path=./lighthouse-report",
      "--quiet",
    ],
    { stdio: "inherit", shell: true }
  );

  lighthouse.on("exit", (code) => cleanup(code ?? 1));
  lighthouse.on("error", () => cleanup(1));
};

run().catch(() => cleanup(1));
