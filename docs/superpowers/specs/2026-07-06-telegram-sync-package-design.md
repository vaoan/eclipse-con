# Telegram Sync Package — Design

- **Date:** 2026-07-06
- **Status:** Approved (design), pending implementation plan
- **Author:** Heiner Angarita + Claude
- **Related:** [`2026-07-06-moonfest-monorepo-migration-design.md`](./2026-07-06-moonfest-monorepo-migration-design.md) (built during phase one),
  [`2026-07-06-sunfest-teaser-site-design.md`](./2026-07-06-sunfest-teaser-site-design.md) (future consumer)

## 1. Summary

Extract today's moonfest-only Telegram tooling into a reusable workspace package,
**`packages/telegram-sync/`**, that turns a Telegram channel into a localized, **curated** news feed
for any event app. Each app configures its own feed via a committed, non-secret
`telegram.config.json`. Shared account credentials stay in root `.env.local`.

The driving requirement: a single channel may **interleave events** — mid-moonfest they may promote
sunfest2027, then continue posting moonfest news. Date/channel filtering alone cannot separate
interleaved topics, so the package supports **per-message selection by ID and by keyword**, in both
directions (force-in and force-out).

moonfest is the first consumer, wired with **exactly today's values** — no behavior change.

## 2. Goals & Non-Goals

### Goals

- One package, many event feeds — each app points at a channel/thread/date window and gets its own
  `messages.json` + media.
- **Precise curation:** include/exclude individual messages by **ID** and by **keyword**.
- Config that is **committed and reviewable** (non-secret feed settings) vs **secret** (account creds,
  provider keys) kept in env.
- Preserve the existing WSL self-heal bootstrap (unattended dependency provisioning).
- moonfest output identical to today's.

### Non-Goals

- No curation GUI — curation is editing a committed JSON file, aided by a `list` helper (§6).
- No shared raw-message datastore — each app fetches its own window + explicit includes (§7).
- No sunfest fetching yet — sunfest gets a placeholder config until it has a news UI to render into.

## 3. Package Shape

```
packages/telegram-sync/
  src/
    fetch.py            # pull messages (was scripts/fetch-telegram.py)
    translate.py        # localize (was scripts/translate-telegram.py)
    select.py           # NEW: apply ID + keyword include/exclude to fetched messages
    list.py             # NEW: print recent messages as "id — date — preview" for curation
    _bootstrap.py       # WSL/venv self-heal (was scripts/_telegram_bootstrap.py)
  bin/
    resolve-python.mjs  # interpreter resolver (was scripts/resolve-python.mjs)
    sync.mjs            # orchestrator: fetch → select → translate for a given app config
  package.json          # name: @furrycolombia/telegram-sync
```

Each consuming app keeps thin scripts that invoke the package with its own config, e.g.
`apps/moonfest2026/package.json`:

```jsonc
"scripts": {
  "sync:telegram": "node ../../packages/telegram-sync/bin/sync.mjs --config ./telegram.config.json",
  "telegram:list": "node ../../packages/telegram-sync/bin/sync.mjs list --config ./telegram.config.json"
}
```

## 4. Per-App Config (`telegram.config.json`, committed)

```jsonc
{
  "target": "t.me/FurryMoonfest", // channel/group
  "threadId": 3, // optional topic/thread
  "since": "2025-11-08 19:00", // date window start (local)
  "translateTo": "en", // localization target
  "outDir": "public/telegram", // app-relative output (messages.json + media/)
  "select": {
    "includeIds": [], // force these messages IN (fetched by id even if older than `since`)
    "excludeIds": [5123], // force these messages OUT
    "includeKeywords": [], // force-in messages whose text matches (within fetch horizon)
    "excludeKeywords": [], // force-out messages whose text matches (case-insensitive substring)
  },
}
```

Secrets stay in root `.env.local`: `TELEGRAM_API_ID/HASH/PHONE`, the `telegram.session` file, and
translation provider keys (`ANTHROPIC_API_KEY`, `OPENAI_*`, `TRANSLATE_PROVIDER`). One Telegram
account serves every feed.

## 5. Selection Semantics (deterministic precedence)

Per message, the **first** matching rule decides — top wins, so behavior is always predictable:

1. `select.excludeIds` contains its id → **OUT** (absolute; wins over everything).
2. `select.includeIds` contains its id → **IN** (absolute; bypasses the date window).
3. text matches any `select.excludeKeywords` → **OUT**.
4. text matches any `select.includeKeywords` → **IN**.
5. message falls within the `since` … now window (and thread) → **IN**, otherwise **OUT**.

Keyword match = case-insensitive substring on the message text (hashtags like `#sunfest2027` work
naturally). Rules 1–2 are exact IDs (independent of posting discipline); rules 3–4 catch patterns
without hunting individual IDs. Conflicting `includeIds`/`excludeIds` on the same id resolve to OUT
(rule 1) and emit a warning.

**Worked example — the interleaved case.** A sunfest promo (id `5123`) posted mid-moonfest:

- moonfest config: `excludeIds: [5123]` (or `excludeKeywords: ["sunfest"]`) → dropped from moonfest.
- sunfest config: `includeIds: [5123]` → pulled into sunfest even though it predates sunfest's window.

## 6. Curation Workflow

1. `pnpm --filter <app> telegram:list` prints recent messages as `id — date — text preview`.
2. Human moves ids/keywords into that app's `telegram.config.json` `select` block.
3. Re-run sync; the committed config is the **single source of truth** for what each feed shows —
   versioned, reviewable, no hidden state.

## 7. Fetch Model

- Fetch = messages on `target`/`threadId` from `since` to now, **plus** any `select.includeIds`
  fetched explicitly by id (Telethon `get_messages(ids=…)`), so promos outside the window can be
  pulled in.
- Apply §5 selection, then translate, then write `<outDir>/messages.json` (+ `media/`).
- No shared raw store: each app fetches independently. Fine for a low-volume news channel; revisit if
  volume or duplicate-fetch cost ever justifies a shared cache.

## 8. Preserved Behavior & Migration Notes

- The **WSL self-heal** (venv bootstrap, Windows-python fast-path, interpreter resolver) moves into the
  package unchanged in behavior — sync still runs unattended from WSL-root or Windows.
- moonfest's current `.env.local` feed values (`TELEGRAM_TARGET`, `THREAD_ID`, `SINCE`) migrate into
  `apps/moonfest2026/telegram.config.json`; secrets remain in env. Output path and `messages.json`
  shape are unchanged, so the moonfest NewsSection renders identically.
- The finished-but-uncommitted WSL self-heal work in the current tree is committed **first**, then
  relocated into the package as part of phase one.

## 9. Sunfest Consumer (deferred)

sunfest gets a committed `telegram.config.json` **placeholder** (documented, not wired to fetch) until
the full site has a news UI. Whether it uses its **own channel** or the **same channel date/keyword
filtered** is then a one-file config choice — the package supports both with no code change.

## 10. Testing

- Unit (selection): table-driven cases over §5 precedence — id-in, id-out, keyword-in, keyword-out,
  window edges, include/exclude conflict.
- Golden: moonfest config + a fixed fetched fixture → `messages.json` matches today's shape.
- Bootstrap: existing WSL/venv self-heal verification still passes from a pip-less `python3`.
