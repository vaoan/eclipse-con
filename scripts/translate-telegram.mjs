import { spawnSync } from "node:child_process";

function tryRun(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit" });
  return result.status === 0 ? command : null;
}

const pythonCmd =
  tryRun("python", ["--version"]) || tryRun("python3", ["--version"]);

if (!pythonCmd) {
  console.error(
    [
      "Python is required to translate Telegram news (Python 3.10+).",
      "Install instructions:",
      "  Windows: https://www.python.org/downloads/ (enable 'Add Python to PATH')",
      "  macOS:   brew install python",
      "  Linux:   sudo apt-get install python3 python3-pip",
      "",
      "Then re-run: pnpm translate:telegram",
    ].join("\n")
  );
  process.exit(1);
}

const run = spawnSync(pythonCmd, ["scripts/translate-telegram.py"], {
  stdio: "inherit",
});

process.exit(run.status ?? 1);
