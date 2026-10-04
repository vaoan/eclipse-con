-- fco-links initial schema. See docs/superpowers/specs/2026-10-03-fco-links-design.md.

-- Synced copy of the Google Sheet "Links" tab. Rows are never deleted: a slug
-- removed from the Sheet keeps its last destination (in_sheet = 0), so a
-- printed QR code can never break by accident.
CREATE TABLE links (
  slug        TEXT PRIMARY KEY,
  destination TEXT NOT NULL,
  label       TEXT,
  campaign    TEXT,
  active      INTEGER NOT NULL DEFAULT 1,
  in_sheet    INTEGER NOT NULL DEFAULT 1,
  sheet_row   INTEGER,
  first_seen  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL
);

-- One row per redirect (GET). Never the raw IP: location is derived from it at
-- capture time and visitor_hash is an HMAC with a key that rotates daily.
-- day/hour are Bogotá time (UTC-5, no DST); human = not bot, preview or miss;
-- is_first = first human click of this visitor on this slug that day.
CREATE TABLE clicks (
  id              INTEGER PRIMARY KEY,
  slug            TEXT NOT NULL,
  ts              INTEGER NOT NULL,
  day             TEXT NOT NULL,
  hour            INTEGER NOT NULL,
  country         TEXT,
  region          TEXT,
  city            TEXT,
  postal          TEXT,
  continent       TEXT,
  lat             REAL,
  lon             REAL,
  timezone        TEXT,
  colo            TEXT,
  asn             INTEGER,
  as_org          TEXT,
  device          TEXT,
  os              TEXT,
  os_version      TEXT,
  browser         TEXT,
  browser_version TEXT,
  device_vendor   TEXT,
  device_model    TEXT,
  referrer_host   TEXT,
  referrer        TEXT,
  lang            TEXT,
  utm_source      TEXT,
  utm_medium      TEXT,
  utm_campaign    TEXT,
  utm_content     TEXT,
  utm_term        TEXT,
  is_bot          INTEGER NOT NULL DEFAULT 0,
  is_preview      INTEGER NOT NULL DEFAULT 0,
  preview_app     TEXT,
  visitor_hash    TEXT,
  miss            INTEGER NOT NULL DEFAULT 0,
  human           INTEGER NOT NULL DEFAULT 0,
  is_first        INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX clicks_slug_ts ON clicks (slug, ts);
CREATE INDEX clicks_slug_visitor ON clicks (slug, visitor_hash);
-- Lets the CSV export turn a date range into an id range without a scan.
CREATE INDEX clicks_ts ON clicks (ts);

-- Pre-aggregated stats; every dashboard chart reads this, never raw clicks.
-- clicks/uniques count humans only; bots and previews are kept apart.
CREATE TABLE daily_stats (
  date     TEXT NOT NULL,
  slug     TEXT NOT NULL,
  dim      TEXT NOT NULL,
  value    TEXT NOT NULL,
  clicks   INTEGER NOT NULL DEFAULT 0,
  uniques  INTEGER NOT NULL DEFAULT 0,
  bots     INTEGER NOT NULL DEFAULT 0,
  previews INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (date, slug, dim, value)
);

-- Lifetime totals and last click per slug, maintained by the rollup.
CREATE TABLE link_stats (
  slug          TEXT PRIMARY KEY,
  clicks        INTEGER NOT NULL DEFAULT 0,
  uniques       INTEGER NOT NULL DEFAULT 0,
  bots          INTEGER NOT NULL DEFAULT 0,
  previews      INTEGER NOT NULL DEFAULT 0,
  last_click_at INTEGER
);

-- Highest click id already rolled into daily_stats / link_stats.
CREATE TABLE rollup_cursor (
  id            INTEGER PRIMARY KEY CHECK (id = 1),
  last_click_id INTEGER NOT NULL DEFAULT 0,
  ran_at        INTEGER
);
INSERT INTO rollup_cursor (id, last_click_id) VALUES (1, 0);

-- The latest sync outcome (overwritten every run).
CREATE TABLE sync_state (
  id          INTEGER PRIMARY KEY CHECK (id = 1),
  ran_at      INTEGER,
  ok          INTEGER,
  rows        INTEGER,
  changed     INTEGER,
  errors      TEXT,
  message     TEXT
);
INSERT INTO sync_state (id) VALUES (1);

-- History of sync runs that changed something or failed (quiet runs are not
-- logged, so this does not grow by 1,440 rows a day).
CREATE TABLE sync_runs (
  id      INTEGER PRIMARY KEY,
  ts      INTEGER NOT NULL,
  ok      INTEGER NOT NULL,
  rows    INTEGER NOT NULL,
  changed INTEGER NOT NULL,
  errors  TEXT
);

-- Bookkeeping for the nightly Sheet summary and the weekly R2 export.
CREATE TABLE job_state (
  name    TEXT PRIMARY KEY,
  last_at INTEGER,
  detail  TEXT
);
