import { spawnSync } from "node:child_process";
import { resolvePythonCommand } from "./resolve-python.mjs";

const pythonCmd = resolvePythonCommand();

if (!pythonCmd) {
  console.error(
    [
      "Could not prepare a Python 3.10+ interpreter with Telethon for Telegram sync.",
      "The script provisions dependencies automatically, but the environment blocked it.",
      "Install instructions:",
      "  Windows: https://www.python.org/downloads/ (enable 'Add Python to PATH')",
      "  macOS:   brew install python",
      "  Linux:   sudo apt-get install -y python3 python3-venv",
      "  WSL:     ensure Windows Python (with Telethon) is reachable, or run as root",
      "           so python3-venv can be installed automatically",
      "",
      "Then re-run: pnpm fetch:telegram",
    ].join("\n")
  );
  process.exit(1);
}

const run = spawnSync(pythonCmd, ["scripts/fetch-telegram.py"], {
  stdio: "inherit",
});

process.exit(run.status ?? 1);
