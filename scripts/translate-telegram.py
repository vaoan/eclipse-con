import json
import os
import subprocess
import sys
import time
import urllib.parse
import urllib.request
import uuid
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


def openai_translate(text: str, api_key: str, model: str) -> str:
    payload = {
        "model": model,
        "input": f"Translate to English. Preserve emojis, formatting, and names.\n\n{text}",
        "text": {"format": {"type": "text"}},
    }

    request = urllib.request.Request(
        "https://api.openai.com/v1/responses",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    last_error = None
    for attempt in range(9):
        try:
            with urllib.request.urlopen(request, timeout=60) as response:
                data = json.loads(response.read().decode("utf-8"))
            break
        except urllib.error.HTTPError as error:
            last_error = error
            if error.code == 429:
                wait_seconds = min(90, 2 ** attempt)
                print(
                    f"\n[translate] OpenAI 429 on attempt {attempt + 1}/9. "
                    f"Retrying in {wait_seconds}s..."
                )
                time.sleep(min(90, 2 ** attempt))
                continue
            raise
    else:
        if last_error:
            raise last_error
        raise RuntimeError("OpenAI translation failed")

    if "output_text" in data and data["output_text"]:
        return data["output_text"].strip()

    output = data.get("output", [])
    for item in output:
        if item.get("type") == "message":
            content = item.get("content", [])
            for part in content:
                if part.get("type") == "output_text" and part.get("text"):
                    return str(part["text"]).strip()

    return text


def azure_translate(
    text: str,
    api_key: str,
    region: str,
    endpoint: str,
    from_lang: str,
    to_lang: str,
) -> str:
    query = {
        "api-version": "3.0",
        "to": to_lang,
    }
    if from_lang:
        query["from"] = from_lang

    request_url = (
        f"{endpoint.rstrip('/')}/translate?{urllib.parse.urlencode(query)}"
    )
    payload = [{"text": text}]

    last_error = None
    for attempt in range(6):
        request = urllib.request.Request(
            request_url,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Ocp-Apim-Subscription-Key": api_key,
                "Ocp-Apim-Subscription-Region": region,
                "Content-Type": "application/json; charset=UTF-8",
                "X-ClientTraceId": str(uuid.uuid4()),
            },
            method="POST",
        )
        try:
            with urllib.request.urlopen(request, timeout=60) as response:
                data = json.loads(response.read().decode("utf-8"))
            if not data:
                return text
            first_item = data[0] if isinstance(data, list) else {}
            translations = first_item.get("translations", [])
            if translations and translations[0].get("text"):
                return str(translations[0]["text"]).strip()
            return text
        except urllib.error.HTTPError as error:
            last_error = error
            if error.code in {429, 503}:
                wait_seconds = min(30, 2 ** attempt)
                print(
                    f"\n[translate] Azure {error.code} on attempt "
                    f"{attempt + 1}/6. Retrying in {wait_seconds}s..."
                )
                time.sleep(wait_seconds)
                continue
            raise

    if last_error:
        raise last_error
    raise RuntimeError("Azure translation failed")


def load_existing_translations(path: Path) -> dict[int, str]:
    if not path.exists():
        return {}
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        messages = data.get("messages", [])
        return {
            int(message.get("id")): message.get("text", "")
            for message in messages
            if message.get("text")
        }
    except json.JSONDecodeError:
        return {}


def render_progress(
    current: int,
    total: int,
    translated: int,
    cached: int,
    skipped: int,
) -> None:
    width = 24
    ratio = min(1.0, max(0.0, current / total)) if total else 1.0
    filled = int(round(ratio * width))
    bar = "#" * filled + "-" * (width - filled)
    percent = int(round(ratio * 100))
    sys.stdout.write(
        f"\r[translate] [{bar}] {current}/{total} {percent}% | "
        f"new {translated} | cached {cached} | skipped {skipped}"
    )
    sys.stdout.flush()


def build_target(
    source_data: dict,
    translated_messages: list[dict],
    translated_by: str,
) -> dict:
    return {
        "source": source_data.get("source", ""),
        "fetchedAt": datetime.now(timezone.utc).isoformat(),
        "translatedBy": translated_by,
        "messages": translated_messages,
    }


def write_checkpoint(
    path: Path,
    source_data: dict,
    translated_messages: list[dict],
    translated_by: str,
) -> None:
    target = build_target(source_data, translated_messages, translated_by)
    path.write_text(
        json.dumps(target, ensure_ascii=False, indent=2), encoding="utf-8"
    )


def main() -> None:
    base_dir = Path(__file__).resolve().parent.parent
    load_env_file(base_dir / ".env.local")
    load_env_file(base_dir / ".env.development")

    out_dir = base_dir / "public" / "telegram"
    source_path = out_dir / "messages.json"
    target_path = out_dir / "messages.en.json"

    provider = os.environ.get("TRANSLATE_PROVIDER", "azure").strip().lower()
    to_lang = os.environ.get("TRANSLATE_TO", "en").strip() or "en"
    translated_by = "Azure AI Translator"
    fallback_translate_text = None
    fallback_provider_label = ""

    if provider == "azure":
        azure_key = require_env("AZURE_TRANSLATOR_KEY")
        azure_region = require_env("AZURE_TRANSLATOR_REGION")
        azure_endpoint = os.environ.get(
            "AZURE_TRANSLATOR_ENDPOINT",
            "https://api.cognitive.microsofttranslator.com",
        ).strip()
        azure_from = os.environ.get("AZURE_TRANSLATOR_FROM", "es").strip()

        def translate_text(input_text: str) -> str:
            return azure_translate(
                input_text,
                azure_key,
                azure_region,
                azure_endpoint,
                azure_from,
                to_lang,
            )

        openai_key = os.environ.get("OPENAI_API_KEY", "").strip()
        if openai_key:
            openai_model = os.environ.get("OPENAI_MODEL", "gpt-4o-mini").strip()

            def fallback_translate_text(input_text: str) -> str:
                return openai_translate(input_text, openai_key, openai_model)

            fallback_provider_label = f"OpenAI ({openai_model})"
            translated_by = (
                "Azure AI Translator (fallback: "
                f"{fallback_provider_label})"
            )

    elif provider == "openai":
        api_key = require_env("OPENAI_API_KEY")
        model = os.environ.get("OPENAI_MODEL", "gpt-4o-mini").strip()
        translated_by = f"OpenAI ({model})"

        def translate_text(input_text: str) -> str:
            return openai_translate(input_text, api_key, model)

    else:
        raise SystemExit(
            "Invalid TRANSLATE_PROVIDER. Use 'azure' or 'openai'."
        )

    print(
        f"[translate] Provider={provider} target={to_lang} "
        f"checkpoint={target_path}"
    )
    if fallback_translate_text and fallback_provider_label:
        print(
            "[translate] Fallback enabled: Azure -> "
            f"{fallback_provider_label}"
        )

    if not source_path.exists():
        raise SystemExit("Missing messages.json. Run pnpm fetch:telegram first.")

    source_data = json.loads(source_path.read_text(encoding="utf-8"))
    messages = source_data.get("messages", [])
    existing = load_existing_translations(target_path)

    translated = []
    missing_count = 0
    total = len(messages)
    processed = 0
    translated_new = 0
    cached_count = 0
    skipped_count = 0
    fallback_used_count = 0
    for message in messages:
        text = message.get("text") or ""
        if text:
            cached = existing.get(int(message["id"]))
            if cached:
                text_en = cached
                cached_count += 1
                print(
                    f"\n[translate] #{message['id']} cached "
                    f"({len(text_en)} chars)"
                )
                print(f"[translate] #{message['id']} text:\n{text_en}\n")
            else:
                try:
                    text_en = translate_text(text)
                except urllib.error.HTTPError as primary_error:
                    if fallback_translate_text:
                        print(
                            f"\n[translate] #{message['id']} primary failed "
                            f"({primary_error.code}). Trying fallback..."
                        )
                        try:
                            text_en = fallback_translate_text(text)
                            fallback_used_count += 1
                            print(
                                f"[translate] #{message['id']} used fallback "
                                f"{fallback_provider_label}"
                            )
                        except urllib.error.HTTPError:
                            text_en = ""
                    else:
                        text_en = ""
                if text_en:
                    existing[int(message["id"])] = text_en
                    translated_new += 1
                    print(
                        f"\n[translate] #{message['id']} translated "
                        f"({len(text_en)} chars)"
                    )
                    print(f"[translate] #{message['id']} text:\n{text_en}\n")
                else:
                    missing_count += 1
                    print(f"\n[translate] #{message['id']} no translation yet")
        else:
            text_en = ""
            skipped_count += 1
            print(f"\n[translate] #{message['id']} skipped (no text)")
        translated.append(
            {
                "id": message["id"],
                "date": message["date"],
                "text": text_en,
                "media": message.get("media", []),
            }
        )
        write_checkpoint(target_path, source_data, translated, translated_by)
        processed += 1
        render_progress(
            processed, total, translated_new, cached_count, skipped_count
        )

    if total:
        sys.stdout.write("\n")

    target = build_target(source_data, translated, translated_by)
    target_path.write_text(
        json.dumps(target, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"Saved English messages to {target_path}")
    if fallback_used_count:
        print(
            f"{fallback_used_count} messages were translated with fallback "
            f"provider ({fallback_provider_label})."
        )
    if missing_count:
        print(f"{missing_count} messages still missing translation. Re-run later.")


if __name__ == "__main__":
    ensure_telethon()
    main()
