import io
import json
import os
import shutil
import subprocess
import sys
import tempfile
import time
import urllib.parse
import urllib.request
import uuid
from datetime import datetime, timezone
from pathlib import Path

# Ensure stdout can handle Unicode (emojis in translated text) on Windows
if sys.stdout.encoding and sys.stdout.encoding.lower() not in ("utf-8", "utf8"):
    sys.stdout = io.TextIOWrapper(
        sys.stdout.buffer, encoding="utf-8", errors="replace"
    )
    sys.stderr = io.TextIOWrapper(
        sys.stderr.buffer, encoding="utf-8", errors="replace"
    )


from _bootstrap import ensure_packages  # noqa: E402


def ensure_telethon() -> None:
    ensure_packages("telethon")


def ensure_anthropic() -> None:
    ensure_packages("anthropic")


def require_env(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        raise SystemExit(f"Missing environment variable: {name}")
    return value


def build_translation_prompt(text: str) -> str:
    return (
        "Translate to English. Preserve emojis, formatting, and names. "
        f"Return only the translated text, no commentary.\n\n{text}"
    )


def is_rate_limit_error(message: str) -> bool:
    lowered = message.lower()
    return (
        "rate" in lowered
        or "429" in lowered
        or "too many requests" in lowered
        or "overloaded" in lowered
    )


def is_cli_access_error(message: str) -> bool:
    lowered = message.lower()
    return any(
        needle in lowered
        for needle in (
            "subscription",
            "license",
            "billing",
            "payment",
            "upgrade",
            "not logged in",
            "login required",
            "authentication",
            "unauthorized",
            "forbidden",
            "quota",
            "credits",
            "plan",
        )
    )


def command_exists(command: str) -> bool:
    return shutil.which(command) is not None


def gh_copilot_available() -> bool:
    if not command_exists("gh"):
        return False
    result = subprocess.run(
        ["gh", "copilot", "--", "--help"],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    return result.returncode == 0


def format_error(error: Exception) -> str:
    if isinstance(error, urllib.error.HTTPError):
        return f"HTTP {error.code}"
    return str(error) or error.__class__.__name__


def run_cli_with_retries(
    label: str,
    command: list[str],
    *,
    input_text: str | None = None,
    env: dict[str, str] | None = None,
    output_path: Path | None = None,
) -> str:
    for attempt in range(9):
        result = subprocess.run(
            command,
            input=input_text,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            env=env,
        )
        if result.returncode == 0:
            if output_path is not None:
                translated = output_path.read_text(encoding="utf-8").strip()
            else:
                translated = result.stdout.strip()
            return translated or (input_text or "")

        stderr = (result.stderr or result.stdout).strip()
        if is_rate_limit_error(stderr):
            wait_seconds = min(90, 2 ** attempt)
            print(
                f"\n[translate] {label} rate limit on attempt "
                f"{attempt + 1}/9. Retrying in {wait_seconds}s..."
            )
            time.sleep(wait_seconds)
            continue
        raise RuntimeError(f"{label} error: {stderr or 'unknown error'}")

    raise RuntimeError(f"{label} translation failed after retries")


def claude_code_translate(text: str) -> str:
    prompt = build_translation_prompt(text)
    env = {k: v for k, v in os.environ.items() if k != "ANTHROPIC_API_KEY"}
    return run_cli_with_retries(
        "Claude Code CLI",
        ["claude", "-p", prompt],
        env=env,
        input_text=text,
    )


def codex_cli_translate(text: str) -> str:
    prompt = build_translation_prompt(text)
    model = os.environ.get("CODEX_MODEL", "").strip()

    with tempfile.NamedTemporaryFile(
        mode="w", encoding="utf-8", delete=False, suffix=".txt"
    ) as handle:
        output_path = Path(handle.name)

    try:
        command = [
            "codex",
            "exec",
            "--skip-git-repo-check",
            "--ignore-rules",
            "--ephemeral",
            "--sandbox",
            "read-only",
            "--color",
            "never",
            "--output-last-message",
            str(output_path),
            "-",
        ]
        if model:
            command[2:2] = ["--model", model]

        return run_cli_with_retries(
            "Codex CLI",
            command,
            input_text=prompt,
            output_path=output_path,
        )
    finally:
        output_path.unlink(missing_ok=True)


def copilot_cli_translate(text: str) -> str:
    prompt = build_translation_prompt(text)
    return run_cli_with_retries(
        "GitHub Copilot CLI",
        ["gh", "copilot", "-p", prompt],
        input_text=text,
    )


def claude_translate(text: str, api_key: str, model: str) -> str:
    import anthropic

    client = anthropic.Anthropic(api_key=api_key)

    last_error = None
    for attempt in range(9):
        try:
            message = client.messages.create(
                model=model,
                max_tokens=4096,
                messages=[
                    {
                        "role": "user",
                        "content": (
                            "Translate to English. Preserve emojis, formatting, "
                            f"and names. Return only the translated text.\n\n{text}"
                        ),
                    }
                ],
            )
            for block in message.content:
                if block.type == "text":
                    return block.text.strip()
            return text
        except anthropic.RateLimitError as error:
            last_error = error
            wait_seconds = min(90, 2 ** attempt)
            print(
                f"\n[translate] Claude 429 on attempt {attempt + 1}/9. "
                f"Retrying in {wait_seconds}s..."
            )
            time.sleep(wait_seconds)
            continue
        except anthropic.APIError:
            raise

    if last_error:
        raise last_error
    raise RuntimeError("Claude translation failed")


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


def load_existing_target(path: Path) -> dict:
    if not path.exists():
        return {}
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}


def extract_translations(target_data: dict) -> dict[int, str]:
    messages = target_data.get("messages", [])
    return {
        int(message.get("id")): message.get("text", "")
        for message in messages
        if message.get("text")
    }


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


def sort_messages(messages: list[dict]) -> list[dict]:
    return sorted(
        messages,
        key=lambda message: (
            datetime.fromisoformat(str(message["date"])),
            int(message["id"]),
        ),
        reverse=True,
    )


def write_checkpoint(
    path: Path,
    source_data: dict,
    translated_messages: list[dict],
    translated_by: str,
) -> None:
    target = build_target(
        source_data, sort_messages(translated_messages), translated_by
    )
    path.write_text(
        json.dumps(target, ensure_ascii=False, indent=2), encoding="utf-8"
    )


def discover_providers() -> tuple[list[tuple[str, callable]], str]:
    provider = os.environ.get("TRANSLATE_PROVIDER", "openai").strip().lower()
    to_lang = os.environ.get("TRANSLATE_TO", "en").strip() or "en"
    providers: list[tuple[str, callable]] = []

    def add_provider(label: str, func: callable) -> None:
        if any(existing_label == label for existing_label, _ in providers):
            return
        providers.append((label, func))

    def try_add_azure() -> None:
        azure_key = os.environ.get("AZURE_TRANSLATOR_KEY", "").strip()
        azure_region = os.environ.get("AZURE_TRANSLATOR_REGION", "").strip()
        if not azure_key or not azure_region:
            return
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

        add_provider("Azure AI Translator", translate_text)

    def try_add_openai() -> None:
        api_key = os.environ.get("OPENAI_API_KEY", "").strip()
        if not api_key:
            return
        model = os.environ.get("OPENAI_MODEL", "gpt-4o-mini").strip()

        def translate_text(input_text: str) -> str:
            return openai_translate(input_text, api_key, model)

        add_provider(f"OpenAI ({model})", translate_text)

    def try_add_claude_api() -> None:
        api_key = os.environ.get("ANTHROPIC_API_KEY", "").strip()
        if not api_key:
            return
        ensure_anthropic()
        model = os.environ.get("CLAUDE_MODEL", "claude-haiku-4-5").strip()

        def translate_text(input_text: str) -> str:
            return claude_translate(input_text, api_key, model)

        add_provider(f"Claude ({model})", translate_text)

    def try_add_claude_cli() -> None:
        if command_exists("claude"):
            add_provider("Claude Code CLI", claude_code_translate)

    def try_add_codex_cli() -> None:
        if command_exists("codex"):
            model = os.environ.get("CODEX_MODEL", "").strip()
            label = f"Codex CLI ({model})" if model else "Codex CLI"
            add_provider(label, codex_cli_translate)

    def try_add_copilot_cli() -> None:
        if gh_copilot_available():
            add_provider("GitHub Copilot CLI", copilot_cli_translate)

    provider_builders = {
        "azure": try_add_azure,
        "openai": try_add_openai,
        "claude": try_add_claude_api,
        "claude_code": try_add_claude_cli,
        "codex": try_add_codex_cli,
        "copilot": try_add_copilot_cli,
        "auto": lambda: None,
    }
    if provider not in provider_builders:
        raise SystemExit(
            "Invalid TRANSLATE_PROVIDER. Use 'auto', 'azure', 'openai', "
            "'claude', 'claude_code', 'codex', or 'copilot'."
        )

    preferred_order = {
        "auto": [
            try_add_claude_cli,
            try_add_codex_cli,
            try_add_copilot_cli,
            try_add_claude_api,
            try_add_openai,
            try_add_azure,
        ],
        "claude_code": [
            try_add_claude_cli,
            try_add_codex_cli,
            try_add_copilot_cli,
            try_add_claude_api,
            try_add_openai,
            try_add_azure,
        ],
        "codex": [
            try_add_codex_cli,
            try_add_claude_cli,
            try_add_copilot_cli,
            try_add_openai,
            try_add_claude_api,
            try_add_azure,
        ],
        "copilot": [
            try_add_copilot_cli,
            try_add_codex_cli,
            try_add_claude_cli,
            try_add_openai,
            try_add_claude_api,
            try_add_azure,
        ],
        "claude": [
            try_add_claude_api,
            try_add_claude_cli,
            try_add_codex_cli,
            try_add_copilot_cli,
            try_add_openai,
            try_add_azure,
        ],
        "openai": [
            try_add_openai,
            try_add_codex_cli,
            try_add_claude_cli,
            try_add_copilot_cli,
            try_add_claude_api,
            try_add_azure,
        ],
        "azure": [
            try_add_azure,
            try_add_openai,
            try_add_codex_cli,
            try_add_claude_cli,
            try_add_copilot_cli,
            try_add_claude_api,
        ],
    }

    for builder in preferred_order[provider]:
        builder()

    if not providers:
        raise SystemExit(
            "No translation providers available. Configure API keys or install "
            "a supported CLI (claude, codex, gh copilot)."
        )

    translated_by = " -> ".join(label for label, _ in providers)
    print(f"[translate] Provider preference={provider} target={to_lang}")
    print(
        "[translate] Provider chain: "
        + " -> ".join(label for label, _ in providers)
    )
    return providers, translated_by


def main() -> None:
    out_dir = Path(os.environ["TELEGRAM_OUT_DIR"]).resolve()
    source_path = out_dir / "messages.json"
    target_path = out_dir / "messages.en.json"

    if not source_path.exists():
        raise SystemExit("Missing messages.json. Run pnpm fetch:telegram first.")

    source_data = json.loads(source_path.read_text(encoding="utf-8"))
    messages = source_data.get("messages", [])
    existing_target = load_existing_target(target_path)
    existing = extract_translations(existing_target)

    with_text = [m for m in messages if m.get("text")]
    no_text = [m for m in messages if not m.get("text")]
    already_translated = [m for m in with_text if int(m["id"]) in existing]
    needs_translation = [m for m in with_text if int(m["id"]) not in existing]

    print(f"[translate] Source: {len(messages)} messages")
    print(
        f"[translate] Already translated: {len(already_translated)} | "
        f"Need translation: {len(needs_translation)} | "
        f"No text: {len(no_text)}"
    )

    if already_translated:
        ids = ", ".join(str(m["id"]) for m in already_translated)
        print(f"[translate] Cached IDs: {ids}")
    if needs_translation:
        ids = ", ".join(str(m["id"]) for m in needs_translation)
        print(f"[translate] Missing IDs: {ids}")

    if not needs_translation:
        print("[translate] All messages already translated. Nothing to do.")
        target = build_target(
            source_data,
            sort_messages([
                {
                    "id": m["id"],
                    "date": m["date"],
                    "text": existing.get(int(m["id"]), ""),
                    "media": m.get("media", []),
                }
                for m in messages
            ]),
            existing_target.get("translatedBy", "Claude (manual)"),
        )
        target_path.write_text(
            json.dumps(target, ensure_ascii=False, indent=2), encoding="utf-8"
        )
        print(f"[translate] Synced {target_path}")
        return

    providers, translated_by = discover_providers()

    total_missing = len(needs_translation)
    translated_new = 0
    missing_count = 0
    provider_usage: dict[str, int] = {}

    for idx, message in enumerate(needs_translation, 1):
        msg_id = int(message["id"])
        text = message.get("text") or ""
        render_progress(idx, total_missing, translated_new, 0, missing_count)

        text_en = ""
        provider_used = ""
        for provider_label, translate_text in providers:
            try:
                text_en = translate_text(text)
                provider_used = provider_label
                break
            except (
                urllib.error.HTTPError,
                RuntimeError,
                FileNotFoundError,
                OSError,
            ) as provider_error:
                print(
                    f"\n[translate] #{msg_id} {provider_label} failed "
                    f"({format_error(provider_error)})."
                )
                if provider_label != providers[-1][0]:
                    print(
                        f"[translate] #{msg_id} trying next provider..."
                    )

        if text_en:
            existing[msg_id] = text_en
            translated_new += 1
            provider_usage[provider_used] = provider_usage.get(provider_used, 0) + 1
            print(
                f"\n[translate] #{msg_id} translated "
                f"with {provider_used} ({len(text_en)} chars)"
            )
        else:
            missing_count += 1
            print(f"\n[translate] #{msg_id} no translation yet")

    if total_missing:
        render_progress(
            total_missing, total_missing, translated_new, 0, missing_count
        )
        sys.stdout.write("\n")

    translated = [
        {
            "id": m["id"],
            "date": m["date"],
            "text": existing.get(int(m["id"]), ""),
            "media": m.get("media", []),
        }
        for m in messages
    ]

    target = build_target(source_data, sort_messages(translated), translated_by)
    target_path.write_text(
        json.dumps(target, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"Saved English messages to {target_path}")
    if provider_usage:
        usage_summary = ", ".join(
            f"{label}: {count}" for label, count in provider_usage.items()
        )
        print(f"[translate] Provider usage: {usage_summary}")
    if missing_count:
        print(f"{missing_count} messages still missing translation. Re-run later.")


if __name__ == "__main__":
    ensure_telethon()
    main()
