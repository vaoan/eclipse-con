# @furrycolombia/telegram-sync

Standalone package for syncing Telegram channel content (messages, media, translations) into a
site's public data files. Extracted from the moonfest2026 app's `scripts/` directory.

Usage: `telegram-sync <sync|list|remove> --config <path>` — the config file points at the target
channel and output paths. Secrets (Telegram API ID/hash, session, Claude API key) are read from
the root `.env.local` and are never committed.
