import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { release } from "node:os";

/**
 * Detects whether the process runs inside a WSL distribution. Relies on the
 * kernel release string (reported by uname, independent of environment
 * variables) so detection still works in a `sudo`/root shell where
 * WSL_DISTRO_NAME is not propagated.
 *
 * @returns True when running under any WSL distribution.
 */
export function isWsl() {
  if (process.platform !== "linux") return false;
  if (process.env.WSL_DISTRO_NAME || process.env.WSL_INTEROP) return true;
  return release().toLowerCase().includes("microsoft");
}

/**
 * Probes an interpreter by invoking it with `--version`.
 *
 * @param command - Executable name or absolute path to probe.
 * @returns The command when it runs successfully, otherwise null.
 */
function canRun(command) {
  return spawnSync(command, ["--version"], { stdio: "ignore" }).status === 0
    ? command
    : null;
}

/**
 * Locates the Windows Python interpreter from inside WSL when it is not on the
 * Linux PATH — e.g. a `sudo` shell whose secure_path strips the /mnt/c entries.
 * Queries the Windows `where.exe` (reachable by absolute path because the drive
 * stays mounted regardless of PATH) and converts the returned Windows path to
 * its /mnt equivalent.
 *
 * @returns An absolute /mnt path to a runnable Windows Python, or null.
 */
function findWindowsPython() {
  const where = "/mnt/c/Windows/System32/where.exe";
  if (!existsSync(where)) return null;

  for (const exe of ["python.exe", "py.exe"]) {
    const result = spawnSync(where, [exe], { encoding: "utf8" });
    if (result.status !== 0 || !result.stdout) continue;

    const winPath = result.stdout.split(/\r?\n/)[0].trim();
    const match = /^([A-Za-z]):\\(.*)$/.exec(winPath);
    if (!match) continue;

    const mntPath = `/mnt/${match[1].toLowerCase()}/${match[2].replace(/\\/g, "/")}`;
    if (canRun(mntPath)) return mntPath;
  }

  return null;
}

/**
 * Resolves a Python interpreter to launch the Telegram tooling. Under WSL the
 * Windows Python is preferred because it already holds Telethon and the
 * authenticated Telegram session; it is found on PATH or, failing that, via
 * Windows `where.exe`. Otherwise the native Python is used, and the scripts
 * provision their own dependencies (see `_telegram_bootstrap.py`). Set
 * TELEGRAM_FORCE_LINUX_PYTHON to skip Windows Python and use the Linux
 * interpreter (useful for CI or a self-contained venv).
 *
 * @returns The resolved Python command/path, or null when none is available.
 */
export function resolvePythonCommand() {
  const forceLinux = Boolean(process.env.TELEGRAM_FORCE_LINUX_PYTHON);

  if (isWsl() && !forceLinux) {
    return (
      canRun("python.exe") ||
      canRun("py.exe") ||
      findWindowsPython() ||
      canRun("python3") ||
      canRun("python")
    );
  }

  if (process.platform === "win32") {
    return canRun("python") || canRun("python3");
  }

  return canRun("python3") || canRun("python");
}
