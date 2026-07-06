import asyncio
import io
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

# Ensure stdout can handle Unicode (emojis in message text) on Windows
# consoles whose default codepage (e.g. cp1252) can't encode them directly.
if sys.stdout.encoding and sys.stdout.encoding.lower() not in ("utf-8", "utf8"):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

from _bootstrap import ensure_packages  # noqa: E402

ensure_packages("telethon")

from telethon import TelegramClient  # noqa: E402
from telethon.errors import SessionPasswordNeededError  # noqa: E402

from selection import keep
from archive import merge


def require_env(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        raise SystemExit(f"Missing environment variable: {name}")
    return value


async def run() -> None:
    api_id = int(require_env("TELEGRAM_API_ID"))
    api_hash = require_env("TELEGRAM_API_HASH")
    phone = os.environ.get("TELEGRAM_PHONE")
    target = os.environ.get("TELEGRAM_TARGET", "t.me/FurryMoonfest")
    thread_id_raw = os.environ.get("TELEGRAM_THREAD_ID", "").strip()
    thread_id = int(thread_id_raw) if thread_id_raw else None
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

    out_dir = Path(os.environ["TELEGRAM_OUT_DIR"]).resolve()
    media_dir = out_dir / "media"
    session_path = Path(
        os.environ.get("TELEGRAM_SESSION", str(out_dir / "telegram.session"))
    ).resolve()
    source_path = out_dir / "messages.json"
    select_rules = json.loads(os.environ.get("TELEGRAM_SELECT", "{}")) or {
        "includeIds": [],
        "excludeIds": [],
        "includeKeywords": [],
        "excludeKeywords": [],
    }

    out_dir.mkdir(parents=True, exist_ok=True)
    media_dir.mkdir(parents=True, exist_ok=True)

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

    async for message in client.iter_messages(entity, reply_to=thread_id):
        message_date = message.date.astimezone(timezone.utc)
        if (
            since_dt
            and message_date < since_dt
            and message.id not in set(select_rules.get("includeIds", []))
        ):
            break

        entry = {
            "id": message.id,
            "date": message_date.isoformat(),
            "text": message.message or "",
            "media": [],
        }

        if not keep(
            {"id": message.id, "text": entry["text"], "date": message_date},
            select_rules,
            since_dt,
        ):
            continue

        if message.media:
            filename = f"msg_{message.id}"
            saved_path = await client.download_media(message, file=media_dir / filename)
            if saved_path:
                relative_path = Path(saved_path).relative_to(out_dir.parent)
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

    existing_messages = []
    if source_path.exists():
        try:
            existing_messages = json.loads(source_path.read_text(encoding="utf-8")).get(
                "messages", []
            )
        except json.JSONDecodeError:
            existing_messages = []
    combined = merge(existing_messages, messages, target)
    archive_out = {
        "source": target,
        "fetchedAt": datetime.now(timezone.utc).isoformat(),
        "messages": combined,
    }
    source_path.write_text(
        json.dumps(archive_out, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    await client.disconnect()
    print(f"Saved {len(messages)} messages to {source_path}")


if __name__ == "__main__":
    asyncio.run(run())
