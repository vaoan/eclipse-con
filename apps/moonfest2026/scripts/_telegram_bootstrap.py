"""Unattended dependency bootstrap shared by the Telegram sync scripts.

Guarantees the requested third-party packages are importable, even on a Debian
or Ubuntu system Python that ships without pip and marks itself PEP 668
"externally managed". In that case it creates (or reuses) a project-local
virtualenv with pip and re-executes the calling script under it, then installs
any missing package. It runs unattended: `python3-venv` is installed via apt
automatically (as root, or through `sudo -n`) when venv creation needs it.

This lives in the Python scripts on purpose: whatever launches them (the Node
wrapper, a bare `python3`, cron) the pipeline provisions itself and keeps going.
"""

import importlib.util
import os
import subprocess
import sys
from pathlib import Path

_SCRIPTS_DIR = Path(__file__).resolve().parent
_VENV_DIR = _SCRIPTS_DIR / ".venv-telegram"
_VENV_PYTHON = _VENV_DIR / (
    "Scripts/python.exe" if os.name == "nt" else "bin/python"
)


def _in_project_venv() -> bool:
    """True when the current interpreter is this project's virtualenv."""
    try:
        return Path(sys.prefix).resolve() == _VENV_DIR.resolve()
    except OSError:
        return False


def _has_pip() -> bool:
    """True when the current interpreter has a working pip."""
    return (
        subprocess.run(
            [sys.executable, "-m", "pip", "--version"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        ).returncode
        == 0
    )


def _is_externally_managed() -> bool:
    """True when the interpreter is PEP 668 externally-managed (Debian/Ubuntu)."""
    import sysconfig

    stdlib = sysconfig.get_path("stdlib")
    return bool(stdlib) and (Path(stdlib) / "EXTERNALLY-MANAGED").exists()


def _apt_get_install(package: str) -> bool:
    """Install an apt package unattended, as root or via `sudo -n`."""
    is_root = hasattr(os, "geteuid") and os.geteuid() == 0
    apt = ["apt-get"] if is_root else ["sudo", "-n", "apt-get"]
    env = {**os.environ, "DEBIAN_FRONTEND": "noninteractive"}
    if subprocess.run([*apt, "install", "-y", package], env=env).returncode == 0:
        return True
    subprocess.run([*apt, "update"], env=env)
    return subprocess.run([*apt, "install", "-y", package], env=env).returncode == 0


def _create_venv() -> None:
    """Create the project virtualenv, installing python3-venv if venv needs it."""
    if _VENV_PYTHON.exists():
        return
    if subprocess.run([sys.executable, "-m", "venv", str(_VENV_DIR)]).returncode != 0:
        # Debian/Ubuntu strip ensurepip from python3; venv needs python3-venv.
        print("Creating Python virtualenv for Telegram sync...", flush=True)
        if not _apt_get_install("python3-venv"):
            raise SystemExit(
                "Could not install 'python3-venv' automatically. Re-run as root "
                "(or install it manually), then retry the Telegram sync."
            )
        subprocess.check_call([sys.executable, "-m", "venv", str(_VENV_DIR)])


def _importable(package: str) -> bool:
    """True when a top-level package can be located without importing it."""
    try:
        return importlib.util.find_spec(package) is not None
    except (ImportError, ValueError):
        return False


def ensure_packages(*packages: str) -> None:
    """Ensure `packages` are importable, provisioning them unattended.

    On a system Python without usable pip (Debian/Ubuntu), this builds a project
    virtualenv and re-executes the calling script under it, then pip-installs any
    missing package. It is a no-op when everything is already available (e.g. the
    Windows Python used on WSL, which already ships the dependencies).
    """
    needs_venv = (
        os.name != "nt"
        and not _in_project_venv()
        and (not _has_pip() or _is_externally_managed())
    )
    if needs_venv:
        _create_venv()
        # Re-exec the calling script under the venv interpreter (which has pip).
        os.execv(str(_VENV_PYTHON), [str(_VENV_PYTHON), *sys.argv])

    missing = [pkg for pkg in packages if not _importable(pkg)]
    if missing:
        print(f"Installing Python packages: {', '.join(missing)} ...", flush=True)
        subprocess.check_call(
            [sys.executable, "-m", "pip", "install", "--upgrade", *missing]
        )
