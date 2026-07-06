# Telegram-Sync Package (Phase 1b) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract the moonfest-only Telegram tooling into a reusable `packages/telegram-sync/` workspace package that turns any Telegram channel into a curated (ID + keyword include/exclude), append-only, localized news feed driven by a committed per-app `telegram.config.json`.

**Architecture:** A JS orchestrator (`bin/sync.mjs`) reads the per-app config + root secrets and passes values to Python via env; Python does the fetch/translate plus two pure, unit-tested modules — `select.py` (deterministic ingest gate) and `archive.py` (append-only merge keyed by `(source, id)`). moonfest becomes the first consumer with today's exact values; its existing scripts stay working until the final wiring task swaps them.

**Tech Stack:** pnpm workspace, Node ESM (orchestrator), Python 3 + Telethon (fetch), stdlib `unittest` (Python tests — no new deps), the existing WSL self-heal bootstrap.

**Spec:** `docs/superpowers/specs/2026-07-06-telegram-sync-package-design.md`

## Global Constraints

- **Do NOT run a live Telegram sync and do NOT deploy.** Execution builds + unit-tests the package against fixtures. `apps/moonfest2026/public/telegram/messages.json` and `messages.en.json` must NOT be modified by this work. No `wrangler deploy`.
- **The live news pipeline must never break mid-build:** moonfest's current `apps/moonfest2026/scripts/{fetch,translate,sync}-telegram.*`, `_telegram_bootstrap.py`, `resolve-python.mjs` stay untouched and functional until Task 8 swaps them in one commit.
- **Preserve the `messages.json` shape** the live `NewsSection` consumes: `{ "source": <str>, "fetchedAt": <iso>, "messages": [ { "id": <int>, "date": <iso>, "text": <str>, "media": [ { "type","path","name","mime","size" } ] } ] }`. New per-entry fields (e.g. `source`) are additive and allowed; never remove or rename existing fields.
- **Never** `--no-verify`; **never** `git add -A`/`git add .`. Conventional commits ending `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`. pnpm only.
- Python tests use stdlib `unittest`, run with `python -m unittest discover`. No pytest/other test deps added.
- Package name: `@furrycolombia/telegram-sync`, private, at `packages/telegram-sync/`.
- Secrets: shared account/provider creds (`TELEGRAM_API_ID/HASH/PHONE`, `telegram.session`, `ANTHROPIC_API_KEY`, `OPENAI_*`, `TRANSLATE_PROVIDER`) live in **root `.env.local`**; per-app **non-secret** feed settings live in committed `apps/<app>/telegram.config.json`.

## Config Schema (`telegram.config.json`, committed per app)

```jsonc
{
  "target": "t.me/FurryMoonfest",
  "threadId": 3,
  "since": "2025-11-08 19:00",
  "translateTo": "en",
  "outDir": "public/telegram",
  "select": {
    "includeIds": [],
    "excludeIds": [],
    "includeKeywords": [],
    "excludeKeywords": [],
  },
}
```

## Env contract (orchestrator → Python)

`bin/sync.mjs` resolves config + secrets and exports, before spawning Python: `TELEGRAM_TARGET`, `TELEGRAM_THREAD_ID`, `TELEGRAM_SINCE`, `TELEGRAM_OUT_DIR` (absolute), `TELEGRAM_SESSION` (absolute path to shared session), `TELEGRAM_SELECT` (JSON string of the `select` block), `TRANSLATE_TO`, plus all secret vars from root `.env.local`. Python reads these from `os.environ`.

---

## Task 1: Scaffold the package

**Files:**

- Create: `packages/telegram-sync/package.json`, `packages/telegram-sync/src/_bootstrap.py`, `packages/telegram-sync/bin/resolve-python.mjs`, `packages/telegram-sync/README.md`

- [ ] **Step 1: Package manifest**

Create `packages/telegram-sync/package.json`:

```json
{
  "name": "@furrycolombia/telegram-sync",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "bin": {
    "telegram-sync": "bin/sync.mjs"
  }
}
```

- [ ] **Step 2: Copy the bootstrap + interpreter resolver into the package**

Copy the current files verbatim (they are already correct and battle-tested):

```bash
cp apps/moonfest2026/scripts/_telegram_bootstrap.py packages/telegram-sync/src/_bootstrap.py
cp apps/moonfest2026/scripts/resolve-python.mjs packages/telegram-sync/bin/resolve-python.mjs
```

Then in `packages/telegram-sync/src/_bootstrap.py`, update the venv location comment/paths if they reference `scripts/.venv-telegram` — the bootstrap computes `_SCRIPTS_DIR = Path(__file__).resolve().parent` and `_VENV_DIR = _SCRIPTS_DIR / ".venv-telegram"`, which now resolves to `packages/telegram-sync/src/.venv-telegram`. That is correct (no edit needed unless a path is hard-coded). Verify by reading the file.

- [ ] **Step 3: README**

Create `packages/telegram-sync/README.md` with a 5-line summary: what the package does, the `telegram-sync <sync|list|remove> --config <path>` CLI, and that secrets come from root `.env.local`.

- [ ] **Step 4: Verify workspace sees the package**

Run: `pnpm install && pnpm ls --depth -1 2>/dev/null | grep -i telegram-sync || pnpm -r exec node -e "0" 2>&1 | head`
Expected: `pnpm install` succeeds; the workspace now includes `@furrycolombia/telegram-sync`. Add `packages/telegram-sync/src/.venv-telegram/` is already covered by the `.gitignore` `**/.venv-telegram/` rule.

- [ ] **Step 5: Commit**

```bash
git add packages/telegram-sync/package.json packages/telegram-sync/src/_bootstrap.py packages/telegram-sync/bin/resolve-python.mjs packages/telegram-sync/README.md pnpm-lock.yaml
git commit -m "feat(telegram-sync): scaffold package with bootstrap + interpreter resolver

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: Selection logic (`selection.py`) — TDD

**Files:**

- Create: `packages/telegram-sync/src/selection.py`, `packages/telegram-sync/tests/test_select.py`

**Interfaces:**

- Produces: `keep(message: dict, rules: dict, since_dt: datetime | None) -> bool` where `message` has keys `id:int`, `text:str`, `date:datetime` (tz-aware UTC); `rules` has `includeIds:list[int]`, `excludeIds:list[int]`, `includeKeywords:list[str]`, `excludeKeywords:list[str]`. Returns True = ingest, False = skip.

- [ ] **Step 1: Write the failing tests**

Create `packages/telegram-sync/tests/test_select.py`:

```python
import unittest
from datetime import datetime, timezone
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent / "src"))
from selection import keep  # noqa: E402


def msg(id, text="hello", when="2026-01-10T00:00:00+00:00"):
    return {"id": id, "text": text, "date": datetime.fromisoformat(when)}


SINCE = datetime(2026, 1, 1, tzinfo=timezone.utc)
EMPTY = {"includeIds": [], "excludeIds": [], "includeKeywords": [], "excludeKeywords": []}


class TestKeep(unittest.TestCase):
    def test_excludeId_wins_over_everything(self):
        rules = {**EMPTY, "excludeIds": [5], "includeIds": [5], "includeKeywords": ["hello"]}
        self.assertFalse(keep(msg(5), rules, SINCE))

    def test_includeId_bypasses_window(self):
        old = msg(7, when="2020-01-01T00:00:00+00:00")
        self.assertTrue(keep(old, {**EMPTY, "includeIds": [7]}, SINCE))

    def test_excludeKeyword_drops_in_window_message(self):
        rules = {**EMPTY, "excludeKeywords": ["sunfest"]}
        self.assertFalse(keep(msg(8, text="Big SUNFEST promo"), rules, SINCE))

    def test_includeKeyword_pulls_in(self):
        rules = {**EMPTY, "includeKeywords": ["#pin"]}
        old = msg(9, text="please #pin", when="2020-01-01T00:00:00+00:00")
        self.assertTrue(keep(old, rules, SINCE))

    def test_window_default_in_and_out(self):
        self.assertTrue(keep(msg(10, when="2026-02-01T00:00:00+00:00"), EMPTY, SINCE))
        self.assertFalse(keep(msg(11, when="2025-12-01T00:00:00+00:00"), EMPTY, SINCE))

    def test_no_since_keeps_all_undecided(self):
        self.assertTrue(keep(msg(12, when="1999-01-01T00:00:00+00:00"), EMPTY, None))

    def test_keyword_case_insensitive_substring(self):
        self.assertFalse(keep(msg(13, text="SuNFeSt"), {**EMPTY, "excludeKeywords": ["sunfest"]}, SINCE))
```

- [ ] **Step 2: Run — verify it fails**

Run: `cd packages/telegram-sync && python -m unittest tests.test_select -v` (or `py -m unittest` on Windows)
Expected: FAIL — `ModuleNotFoundError: No module named 'select'` or import error.

- [ ] **Step 3: Implement `select.py`**

Create `packages/telegram-sync/src/selection.py`:

```python
"""Deterministic ingest gate: decide whether a fetched message enters a feed."""
from datetime import datetime


def keep(message: dict, rules: dict, since_dt: datetime | None) -> bool:
    """Return True if the message should be ingested, per fixed precedence.

    Order (first match wins): excludeIds → includeIds → excludeKeywords →
    includeKeywords → date window (since_dt). With no since_dt, undecided
    messages are kept.
    """
    mid = int(message["id"])
    text = (message.get("text") or "").lower()

    if mid in set(rules.get("excludeIds", [])):
        return False
    if mid in set(rules.get("includeIds", [])):
        return True
    if any(kw.lower() in text for kw in rules.get("excludeKeywords", [])):
        return False
    if any(kw.lower() in text for kw in rules.get("includeKeywords", [])):
        return True
    if since_dt is None:
        return True
    return message["date"] >= since_dt
```

- [ ] **Step 4: Run — verify pass**

Run: `cd packages/telegram-sync && python -m unittest tests.test_select -v`
Expected: PASS — 7 tests OK.

- [ ] **Step 5: Commit**

```bash
git add packages/telegram-sync/src/selection.py packages/telegram-sync/tests/test_select.py
git commit -m "feat(telegram-sync): ID + keyword ingest selection with fixed precedence

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: Append-only archive merge (`archive.py`) — TDD

**Files:**

- Create: `packages/telegram-sync/src/archive.py`, `packages/telegram-sync/tests/test_archive.py`

**Interfaces:**

- Produces: `merge(existing: list[dict], new: list[dict], source: str) -> list[dict]` — append-only union keyed by `(entry.get("source", source), id)`; existing entries are never dropped; new entries are stamped with `source`; result sorted by `date` desc then `id` desc. `date` values are ISO strings.

- [ ] **Step 1: Write the failing tests**

Create `packages/telegram-sync/tests/test_archive.py`:

```python
import unittest, sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent / "src"))
from archive import merge  # noqa: E402


def e(id, date, source=None):
    d = {"id": id, "date": date, "text": f"m{id}", "media": []}
    if source is not None:
        d["source"] = source
    return d


class TestMerge(unittest.TestCase):
    def test_appends_new_and_keeps_existing(self):
        existing = [e(1, "2026-01-01T00:00:00+00:00")]
        new = [e(2, "2026-01-02T00:00:00+00:00")]
        out = merge(existing, new, "t.me/A")
        self.assertEqual([m["id"] for m in out], [2, 1])  # date desc

    def test_never_removes_existing_even_if_not_in_new(self):
        existing = [e(1, "2026-01-01T00:00:00+00:00"), e(2, "2026-01-02T00:00:00+00:00")]
        out = merge(existing, [], "t.me/A")
        self.assertEqual({m["id"] for m in out}, {1, 2})

    def test_dedup_by_source_and_id(self):
        existing = [e(1, "2026-01-01T00:00:00+00:00", source="t.me/A")]
        new = [e(1, "2026-01-01T00:00:00+00:00")]  # same source+id
        out = merge(existing, new, "t.me/A")
        self.assertEqual(len(out), 1)

    def test_same_id_different_source_coexist(self):
        existing = [e(1, "2026-01-01T00:00:00+00:00", source="t.me/A")]
        new = [e(1, "2026-01-03T00:00:00+00:00")]  # id 1 but source t.me/B
        out = merge(existing, new, "t.me/B")
        self.assertEqual(len(out), 2)

    def test_new_entries_stamped_with_source(self):
        out = merge([], [e(9, "2026-01-01T00:00:00+00:00")], "t.me/B")
        self.assertEqual(out[0]["source"], "t.me/B")
```

- [ ] **Step 2: Run — verify fail**

Run: `cd packages/telegram-sync && python -m unittest tests.test_archive -v`
Expected: FAIL — import error.

- [ ] **Step 3: Implement `archive.py`**

Create `packages/telegram-sync/src/archive.py`:

```python
"""Append-only archive merge keyed by (source, id). Never removes entries."""
from datetime import datetime


def _key(entry: dict, default_source: str):
    return (entry.get("source", default_source), int(entry["id"]))


def merge(existing: list[dict], new: list[dict], source: str) -> list[dict]:
    """Union existing + new, keyed by (source, id); existing wins on conflict.

    New entries are stamped with `source`. Nothing is ever removed. Result is
    sorted by date desc, then id desc.
    """
    combined: dict = {}
    for entry in existing:
        combined[_key(entry, source)] = entry
    for entry in new:
        stamped = {**entry, "source": entry.get("source", source)}
        combined.setdefault(_key(stamped, source), stamped)
    return sorted(
        combined.values(),
        key=lambda m: (datetime.fromisoformat(str(m["date"])), int(m["id"])),
        reverse=True,
    )
```

- [ ] **Step 4: Run — verify pass**

Run: `cd packages/telegram-sync && python -m unittest tests.test_archive -v`
Expected: PASS — 5 tests OK.

- [ ] **Step 5: Commit**

```bash
git add packages/telegram-sync/src/archive.py packages/telegram-sync/tests/test_archive.py
git commit -m "feat(telegram-sync): append-only archive merge keyed by (source, id)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: Fetch (`fetch.py`) — config/env-driven, selection + append-only

**Files:**

- Create: `packages/telegram-sync/src/fetch.py` (adapted from `apps/moonfest2026/scripts/fetch-telegram.py`)

**Interfaces:**

- Consumes: env `TELEGRAM_API_ID/HASH/PHONE`, `TELEGRAM_TARGET`, `TELEGRAM_THREAD_ID`, `TELEGRAM_SINCE`, `TELEGRAM_OUT_DIR` (absolute), `TELEGRAM_SESSION` (absolute), `TELEGRAM_SELECT` (JSON). `selection.keep`, `archive.merge`, `_bootstrap.ensure_packages`.
- Produces: writes `<TELEGRAM_OUT_DIR>/messages.json` in the preserved shape (now with per-entry `source`).

- [ ] **Step 1: Adapt the existing fetch into the package**

Create `packages/telegram-sync/src/fetch.py` starting from `apps/moonfest2026/scripts/fetch-telegram.py`, with these changes (keep everything else — auth flow, media download, message shape — identical):

1. Import the new modules at top (after `ensure_packages("telethon")`):
   ```python
   import json
   from selection import keep
   from archive import merge
   ```
2. Replace the base-dir/path block. Instead of `base_dir = Path(__file__).resolve().parent.parent` and `out_dir = base_dir / "public" / "telegram"`, use env:
   ```python
   out_dir = Path(os.environ["TELEGRAM_OUT_DIR"]).resolve()
   media_dir = out_dir / "media"
   session_path = Path(os.environ.get("TELEGRAM_SESSION", str(out_dir / "telegram.session"))).resolve()
   source_path = out_dir / "messages.json"
   select_rules = json.loads(os.environ.get("TELEGRAM_SELECT", "{}")) or {
       "includeIds": [], "excludeIds": [], "includeKeywords": [], "excludeKeywords": []
   }
   ```
   Remove the two `load_env_file(...)` calls (the orchestrator exports env). Keep `require_env`.
3. In the fetch loop, replace the manual `since_dt` break + existing-id skip with the selection gate applied per candidate, but STILL fetch explicit `includeIds` that are older than the window. Concretely: keep iterating newest→oldest; stop the main scan when a message is older than `since_dt` AND not in `includeIds`; for each candidate build the `entry`, then decide with `keep({"id":..., "text":..., "date": <aware dt>}, select_rules, since_dt)` — skip if False. Preserve the existing "skip empty text+media" rule. (The explicit fetch of `includeIds` older than the window may be a follow-up; for this task the window+in-window select is sufficient and out-of-window includeIds is documented as a known limitation in the report.)
4. Replace the merge/write block with:
   ```python
   existing_messages = []
   if source_path.exists():
       try:
           existing_messages = json.loads(source_path.read_text(encoding="utf-8")).get("messages", [])
       except json.JSONDecodeError:
           existing_messages = []
   combined = merge(existing_messages, messages, target)
   archive_out = {"source": target, "fetchedAt": datetime.now(timezone.utc).isoformat(), "messages": combined}
   source_path.write_text(json.dumps(archive_out, ensure_ascii=False, indent=2), encoding="utf-8")
   ```
   (Delete the old `load_existing_message_ids`, `sort_messages`, and inline combine logic — sorting now lives in `archive.merge`.)

- [ ] **Step 2: Syntax + import check (no live fetch)**

Run: `cd packages/telegram-sync && python -c "import ast; ast.parse(open('src/fetch.py').read()); print('fetch.py parses')"`
Expected: `fetch.py parses`. (Do NOT run the real fetch — it needs live credentials and would change content.)

- [ ] **Step 3: Commit**

```bash
git add packages/telegram-sync/src/fetch.py
git commit -m "feat(telegram-sync): config-driven fetch with selection + append-only merge

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: Translate (`translate.py`) — relocate, config-driven paths

**Files:**

- Create: `packages/telegram-sync/src/translate.py` (adapted from `apps/moonfest2026/scripts/translate-telegram.py`)

- [ ] **Step 1: Copy and adapt**

```bash
cp apps/moonfest2026/scripts/translate-telegram.py packages/telegram-sync/src/translate.py
```

Then in `packages/telegram-sync/src/translate.py`, edit ONLY the path/env resolution in `main()` (leave all provider/translation logic byte-identical):

- Replace `base_dir = Path(__file__).resolve().parent.parent`, the two `load_env_file(...)` calls, and `out_dir = base_dir / "public" / "telegram"` with:
  ```python
  out_dir = Path(os.environ["TELEGRAM_OUT_DIR"]).resolve()
  ```
- Keep `source_path = out_dir / "messages.json"` and `target_path = out_dir / "messages.en.json"` (they already derive from `out_dir`).
- The provider/`TRANSLATE_TO` reads from `os.environ` are unchanged (orchestrator exports them).
- Keep the `ensure_telethon`/`ensure_anthropic` bootstrap calls but update their import to `from _bootstrap import ensure_packages` (the package's bootstrap).

- [ ] **Step 2: Parse check**

Run: `cd packages/telegram-sync && python -c "import ast; ast.parse(open('src/translate.py').read()); print('translate.py parses')"`
Expected: `translate.py parses`.

- [ ] **Step 3: Commit**

```bash
git add packages/telegram-sync/src/translate.py
git commit -m "feat(telegram-sync): relocate translate with config-driven output dir

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 6: List + Remove commands — TDD for remove

**Files:**

- Create: `packages/telegram-sync/src/list_messages.py`, `packages/telegram-sync/src/remove.py`, `packages/telegram-sync/tests/test_remove.py`

**Interfaces:**

- Produces: `remove.drop(archive: dict, message_id: int) -> dict` returns a new archive with the entry removed from `messages` (media files handled separately by the CLI). `list_messages.render(archive: dict, limit: int) -> str` returns `id — date — preview` lines.

- [ ] **Step 1: Failing test for remove**

Create `packages/telegram-sync/tests/test_remove.py`:

```python
import unittest, sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent / "src"))
from remove import drop  # noqa: E402


class TestDrop(unittest.TestCase):
    def test_removes_only_target_id(self):
        arc = {"messages": [{"id": 1, "text": "a"}, {"id": 2, "text": "b"}]}
        out = drop(arc, 1)
        self.assertEqual([m["id"] for m in out["messages"]], [2])

    def test_missing_id_is_noop(self):
        arc = {"messages": [{"id": 2, "text": "b"}]}
        self.assertEqual(len(drop(arc, 99)["messages"]), 1)
```

- [ ] **Step 2: Run — verify fail**

Run: `cd packages/telegram-sync && python -m unittest tests.test_remove -v`
Expected: FAIL — import error.

- [ ] **Step 3: Implement remove.py and list_messages.py**

`packages/telegram-sync/src/remove.py`:

```python
"""Manual, explicit removal of an archived message (the only deletion path)."""


def drop(archive: dict, message_id: int) -> dict:
    """Return a copy of the archive with the given message id removed."""
    kept = [m for m in archive.get("messages", []) if int(m["id"]) != int(message_id)]
    return {**archive, "messages": kept}
```

`packages/telegram-sync/src/list_messages.py`:

```python
"""Curation aid: print recent messages as `id — date — preview` lines."""


def render(archive: dict, limit: int = 40) -> str:
    lines = []
    for m in archive.get("messages", [])[:limit]:
        text = (m.get("text") or "").replace("\n", " ").strip()
        preview = (text[:70] + "…") if len(text) > 70 else text
        lines.append(f"{m['id']} — {m.get('date', '')} — {preview}")
    return "\n".join(lines)
```

- [ ] **Step 4: Run — verify pass**

Run: `cd packages/telegram-sync && python -m unittest tests.test_remove -v`
Expected: PASS — 2 tests OK.

- [ ] **Step 5: Commit**

```bash
git add packages/telegram-sync/src/remove.py packages/telegram-sync/src/list_messages.py packages/telegram-sync/tests/test_remove.py
git commit -m "feat(telegram-sync): list + manual remove commands

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 7: Orchestrator (`bin/sync.mjs`)

**Files:**

- Create: `packages/telegram-sync/bin/sync.mjs`

**Interfaces:**

- Consumes: `resolve-python.mjs` (`resolvePythonCommand`). CLI: `telegram-sync <sync|list|remove> --config <path> [--id <n>]`.
- Produces: reads app `telegram.config.json` + repo-root `.env.local`; exports the env contract; spawns the right Python entry via the resolved interpreter.

- [ ] **Step 1: Implement `bin/sync.mjs`**

Create `packages/telegram-sync/bin/sync.mjs`:

```javascript
#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { resolvePythonCommand } from "./resolve-python.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(HERE, "..", "src");

/** Parse `--flag value` pairs and a positional subcommand from argv. */
function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) args[argv[i].slice(2)] = argv[++i];
    else args._.push(argv[i]);
  }
  return args;
}

/** Load KEY=VALUE pairs from an env file into an object (ignores comments). */
function readEnvFile(path) {
  const out = {};
  if (!existsSync(path)) return out;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#") || !t.includes("=")) continue;
    const i = t.indexOf("=");
    out[t.slice(0, i).trim()] = t
      .slice(i + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
  }
  return out;
}

/** Find the repo root by walking up to the dir containing pnpm-workspace.yaml. */
function repoRoot(start) {
  let dir = start;
  for (let i = 0; i < 8; i++) {
    if (existsSync(resolve(dir, "pnpm-workspace.yaml"))) return dir;
    dir = resolve(dir, "..");
  }
  return start;
}

const args = parseArgs(process.argv.slice(2));
const command = args._[0] ?? "sync";
if (!args.config) {
  console.error(
    "Usage: telegram-sync <sync|list|remove> --config <path> [--id <n>]"
  );
  process.exit(1);
}

const configPath = resolve(process.cwd(), args.config);
const appDir = dirname(configPath);
const config = JSON.parse(readFileSync(configPath, "utf8"));
const outDir = resolve(appDir, config.outDir ?? "public/telegram");
const root = repoRoot(appDir);
const secrets = readEnvFile(resolve(root, ".env.local"));

const env = {
  ...process.env,
  ...secrets,
  TELEGRAM_TARGET: config.target ?? "",
  TELEGRAM_THREAD_ID: config.threadId != null ? String(config.threadId) : "",
  TELEGRAM_SINCE: config.since ?? "",
  TELEGRAM_OUT_DIR: outDir,
  TELEGRAM_SESSION: resolve(root, ".telegram.session"),
  TELEGRAM_SELECT: JSON.stringify(config.select ?? {}),
  TRANSLATE_TO: config.translateTo ?? "en",
};

const python = resolvePythonCommand();
if (!python) {
  console.error(
    "No suitable Python interpreter found. Install Python 3.10+ (see README)."
  );
  process.exit(1);
}

const ENTRY = {
  sync: "fetch.py",
  list: "list_cli.py",
  remove: "remove_cli.py",
};
function runPy(script, extra = []) {
  const r = spawnSync(python, [resolve(SRC, script), ...extra], {
    stdio: "inherit",
    env,
  });
  return r.status ?? 1;
}

if (command === "sync") {
  const code = runPy("fetch.py");
  process.exit(code === 0 ? runPy("translate.py") : code);
} else if (command === "list") {
  process.exit(runPy("list_cli.py"));
} else if (command === "remove") {
  if (!args.id) {
    console.error("remove requires --id <n>");
    process.exit(1);
  }
  process.exit(runPy("remove_cli.py", [args.id]));
} else {
  console.error(`Unknown command: ${command}`);
  process.exit(1);
}
```

- [ ] **Step 2: Add the thin Python CLI wrappers**

Create `packages/telegram-sync/src/list_cli.py`:

```python
import json, os
from pathlib import Path
from list_messages import render

out_dir = Path(os.environ["TELEGRAM_OUT_DIR"]).resolve()
path = out_dir / "messages.json"
archive = json.loads(path.read_text(encoding="utf-8")) if path.exists() else {"messages": []}
print(render(archive, int(os.environ.get("TELEGRAM_LIST_LIMIT", "40"))))
```

Create `packages/telegram-sync/src/remove_cli.py`:

```python
import json, os, sys
from pathlib import Path
from remove import drop

out_dir = Path(os.environ["TELEGRAM_OUT_DIR"]).resolve()
path = out_dir / "messages.json"
message_id = int(sys.argv[1])
archive = json.loads(path.read_text(encoding="utf-8"))
updated = drop(archive, message_id)
path.write_text(json.dumps(updated, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"Removed message {message_id} from {path}")
```

- [ ] **Step 3: Syntax check both**

Run: `node --check packages/telegram-sync/bin/sync.mjs && cd packages/telegram-sync && python -c "import ast; [ast.parse(open(f).read()) for f in ('src/list_cli.py','src/remove_cli.py')]; print('cli parses')"`
Expected: `cli parses` and no node error.

- [ ] **Step 4: Commit**

```bash
git add packages/telegram-sync/bin/sync.mjs packages/telegram-sync/src/list_cli.py packages/telegram-sync/src/remove_cli.py
git commit -m "feat(telegram-sync): orchestrator with sync/list/remove subcommands

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 8: Wire moonfest as the first consumer + secrets split

Swap moonfest onto the package in ONE commit (keeps the live pipeline consistent). This creates the config, repoints scripts, splits secrets, and removes the old per-app telegram scripts.

**Files:**

- Create: `apps/moonfest2026/telegram.config.json`
- Modify: `apps/moonfest2026/package.json`, `apps/moonfest2026/.env.example`, root `.env.local` (untracked), `.gitignore`
- Delete: `apps/moonfest2026/scripts/{fetch-telegram.mjs,fetch-telegram.py,translate-telegram.mjs,translate-telegram.py,sync-telegram.mjs,_telegram_bootstrap.py,resolve-python.mjs}`

- [ ] **Step 1: Create moonfest's feed config (today's values)**

Read the current feed values from `apps/moonfest2026/.env.local` (the `TELEGRAM_TARGET`, `TELEGRAM_THREAD_ID`, `TELEGRAM_SINCE` currently in use — do NOT print secret values). Create `apps/moonfest2026/telegram.config.json`:

```jsonc
{
  "target": "t.me/FurryMoonfest",
  "threadId": 3,
  "since": "2025-11-08 19:00",
  "translateTo": "en",
  "outDir": "public/telegram",
  "select": {
    "includeIds": [],
    "excludeIds": [],
    "includeKeywords": [],
    "excludeKeywords": [],
  },
}
```

Use the ACTUAL current values from the app's `.env.local` for `target`/`threadId`/`since` if they differ from the defaults above.

- [ ] **Step 2: Repoint app scripts to the package**

In `apps/moonfest2026/package.json` `scripts`, replace the telegram entries with:

```json
    "fetch:telegram": "node ../../packages/telegram-sync/bin/sync.mjs sync --config ./telegram.config.json",
    "translate:telegram": "node ../../packages/telegram-sync/bin/sync.mjs sync --config ./telegram.config.json",
    "sync:telegram": "node ../../packages/telegram-sync/bin/sync.mjs sync --config ./telegram.config.json",
    "telegram:list": "node ../../packages/telegram-sync/bin/sync.mjs list --config ./telegram.config.json",
    "telegram:remove": "node ../../packages/telegram-sync/bin/sync.mjs remove --config ./telegram.config.json"
```

(Both `fetch:telegram` and `translate:telegram` now run the full `sync` for simplicity; the granular split is no longer needed. Keep `syn:telegram` removed.)

- [ ] **Step 3: Split secrets to root `.env.local`**

Move the shared account/provider secrets from `apps/moonfest2026/.env.local` to the repo-root `.env.local` (both gitignored — this is a local file operation, no commit of secret values): `TELEGRAM_API_ID`, `TELEGRAM_API_HASH`, `TELEGRAM_PHONE`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `OPENAI_MODEL`, `TRANSLATE_PROVIDER`. Also move the session file: `mv apps/moonfest2026/scripts/telegram.session "$(git rev-parse --show-toplevel)/.telegram.session" 2>/dev/null || true`. Leave the app's `VITE_*` analytics secrets in `apps/moonfest2026/.env.local`. Ensure `.gitignore` covers root `.telegram.session` (add `/.telegram.session` and `/.telegram.session-journal`).

- [ ] **Step 4: Remove the old per-app telegram scripts**

```bash
git rm apps/moonfest2026/scripts/fetch-telegram.mjs apps/moonfest2026/scripts/fetch-telegram.py \
  apps/moonfest2026/scripts/translate-telegram.mjs apps/moonfest2026/scripts/translate-telegram.py \
  apps/moonfest2026/scripts/sync-telegram.mjs apps/moonfest2026/scripts/_telegram_bootstrap.py \
  apps/moonfest2026/scripts/resolve-python.mjs
```

Also update the root `sync-telegram.cmd`/`sync-telegram.ps1` shims to call `node packages/telegram-sync/bin/sync.mjs sync --config apps/moonfest2026/telegram.config.json`.

- [ ] **Step 5: Verify the list command runs against the real archive (read-only, no fetch)**

Run: `pnpm --filter moonfest2026 telegram:list 2>&1 | head -10`
Expected: prints `id — date — preview` lines from the existing `messages.json` — proves config resolution, env contract, interpreter resolution, and `list_messages.render` all work end-to-end without a live sync.

- [ ] **Step 6: Commit**

```bash
git add apps/moonfest2026/telegram.config.json apps/moonfest2026/package.json apps/moonfest2026/.env.example .gitignore sync-telegram.cmd sync-telegram.ps1 apps/moonfest2026/scripts
git commit -m "feat(telegram-sync): wire moonfest onto the package; split shared secrets to root

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 9: Full verification + final review

- [ ] **Step 1: Run all Python unit tests**

Run: `cd packages/telegram-sync && python -m unittest discover -s tests -v`
Expected: all tests from select/archive/remove PASS.

- [ ] **Step 2: Confirm live content untouched**

Run: `git status --short apps/moonfest2026/public/telegram/`
Expected: NO changes to `messages.json` / `messages.en.json` (the build never ran a live sync).

- [ ] **Step 3: Confirm no secrets tracked**

Run: `git ls-files | grep -E "\.env\.local|telegram\.session" || echo "OK: none tracked"`
Expected: `OK: none tracked`.

- [ ] **Step 4: Root gate still green**

Run: `pnpm lint && pnpm --filter moonfest2026 typecheck`
Expected: PASS (the package's `.py`/`.mjs` are outside the app's TS scope; eslint ignores `apps/*/scripts` but the package is under `packages/` — confirm eslint doesn't error on `packages/telegram-sync/bin/*.mjs`; if it does, add `packages/*/bin/**` + `packages/*/src/**` to the eslint `ignores`).

- [ ] **Step 5: Commit any eslint-ignore fix, then stop for review**

If Step 4 needed an eslint ignore addition:

```bash
git add eslint.config.mjs
git commit -m "chore: ignore telegram-sync package sources in eslint

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

Report DONE. Do NOT run a live sync or deploy — those are the user's call once they review.

---

## Self-Review Notes

- **Spec coverage:** §3 package shape → Tasks 1–7. §4 config → Task 8 Step 1 + orchestrator. §5 selection precedence → Task 2. §6 curation/list → Tasks 6–7. §7 fetch/archive append-only → Tasks 3–4. §8 manual removal → Task 6. §9 sunfest deferred → not in scope. §10 tests → Tasks 2,3,6,9. Preserved bootstrap → Task 1. Secrets split → Task 8 Step 3.
- **Known limitation (documented, not a gap):** out-of-window `includeIds` are not force-fetched by id in this iteration (Task 4 Step 1 note) — window + in-window selection is implemented; explicit by-id fetch of older messages is a follow-up.
- **Live-safety:** no task runs a real Telegram sync or deploy; `messages.json`/`.en.json` are only ever read. moonfest's pipeline stays on the old scripts until Task 8 swaps atomically.
