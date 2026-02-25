import asyncio
import json
import os
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path


def ensure_telethon() -> None:
    try:
        import telethon  # noqa: F401
    except ModuleNotFoundError:
        print("Telethon not found. Installing...")
        subprocess.check_call(
            [sys.executable, "-m", "pip", "install", "--upgrade", "telethon"]
        )


ensure_telethon()

from telethon import TelegramClient  # noqa: E402
from telethon.errors import SessionPasswordNeededError  # noqa: E402


def load_env_file(path: Path) -> None:
    if not path.exists():
        return
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        if key and key not in os.environ:
            os.environ[key] = value.strip().strip('"').strip("'")


def require_env(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        raise SystemExit(f"Missing environment variable: {name}")
    return value


def load_existing_message_ids(path: Path) -> set[int]:
    if not path.exists():
        return set()
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        messages = data.get("messages", [])
        return {int(message.get("id")) for message in messages if message.get("id")}
    except json.JSONDecodeError:
        return set()


async def run() -> None:
    base_dir = Path(__file__).resolve().parent.parent
    load_env_file(base_dir / ".env.local")
    load_env_file(base_dir / ".env.development")

    api_id = int(require_env("TELEGRAM_API_ID"))
    api_hash = require_env("TELEGRAM_API_HASH")
    phone = os.environ.get("TELEGRAM_PHONE")
    target = os.environ.get("TELEGRAM_TARGET", "t.me/FurrySunfest")
    since_raw = os.environ.get("TELEGRAM_SINCE", "").strip()
    since_dt = None
    if since_raw:
        parsed = None
        for fmt in ("%Y-%m-%d", "%Y-%m-%d %H:%M", "%Y-%m-%dT%H:%M:%S"):
            try:
                parsed = datetime.strptime(since_raw, fmt)
                break
            except ValueError:
                continue
        if not parsed:
            print("Invalid TELEGRAM_SINCE. Use: YYYY-MM-DD or YYYY-MM-DD HH:MM")
            raise ValueError("Invalid TELEGRAM_SINCE")
        since_dt = parsed.replace(tzinfo=timezone.utc)

    out_dir = base_dir / "public" / "telegram"
    media_dir = out_dir / "media"
    session_path = base_dir / "scripts" / "telegram.session"
    source_path = out_dir / "messages.json"

    out_dir.mkdir(parents=True, exist_ok=True)
    media_dir.mkdir(parents=True, exist_ok=True)

    existing_ids = load_existing_message_ids(source_path)

    client = TelegramClient(str(session_path), api_id, api_hash)

    await client.connect()
    if not await client.is_user_authorized():
        if not phone:
            raise SystemExit("TELEGRAM_PHONE required for first login.")
        await client.send_code_request(phone)
        try:
            try:
                code = input("Enter the Telegram code: ").strip()
            except EOFError:
                code = os.environ.get("TELEGRAM_CODE", "").strip()
            if not code:
                raise SystemExit(
                    "Missing Telegram code. Set TELEGRAM_CODE if running non-interactively."
                )
            await client.sign_in(phone, code)
        except SessionPasswordNeededError:
            try:
                password = input("Enter 2FA password: ").strip()
            except EOFError:
                password = os.environ.get("TELEGRAM_PASSWORD", "").strip()
            if not password:
                raise SystemExit(
                    "Missing 2FA password. Set TELEGRAM_PASSWORD if running non-interactively."
                )
            await client.sign_in(password=password)

    entity = await client.get_entity(target)
    messages = []

    async for message in client.iter_messages(entity):
        if message.id in existing_ids:
            continue
        if since_dt and message.date.astimezone(timezone.utc) < since_dt:
            break
        entry = {
            "id": message.id,
            "date": message.date.astimezone(timezone.utc).isoformat(),
            "text": message.message or "",
            "media": [],
        }

        if message.media:
            filename = f"msg_{message.id}"
            saved_path = await client.download_media(message, file=media_dir / filename)
            if saved_path:
                relative_path = Path(saved_path).relative_to(base_dir / "public")
                media_item = {
                    "type": message.media.__class__.__name__,
                    "path": str(relative_path).replace("\\", "/"),
                    "name": message.file.name if message.file else None,
                    "mime": message.file.mime_type if message.file else None,
                    "size": message.file.size if message.file else None,
                }
                entry["media"].append(media_item)

        if not entry["text"] and not entry["media"]:
            continue

        messages.append(entry)

    archive = {
        "source": target,
        "fetchedAt": datetime.now(timezone.utc).isoformat(),
        "messages": messages,
    }

    if source_path.exists():
        try:
            existing_data = json.loads(source_path.read_text(encoding="utf-8"))
            existing_messages = existing_data.get("messages", [])
            combined = existing_messages + messages
            archive["messages"] = combined
        except json.JSONDecodeError:
            pass

    with source_path.open("w", encoding="utf-8") as handle:
        json.dump(archive, handle, ensure_ascii=False, indent=2)

    await client.disconnect()
    print(f"Saved {len(messages)} messages to {out_dir / 'messages.json'}")


if __name__ == "__main__":
    asyncio.run(run())
