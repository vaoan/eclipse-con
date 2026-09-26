# Lighthouse & Accessibility Audit

Runs a full audit of **`apps/sunfest2027`**, the active site: **Lighthouse** (Performance · Accessibility · Best-Practices · SEO) plus **axe-core WCAG 2.1 AA** runtime scan.

Sunfest is a single page with no router, so the only route is `root`. (The archived Moonfest app also has `/registration-tutorial` — pass `--routes root,/registration-tutorial` and run against `pnpm dev:moonfest` if you were explicitly asked to audit it.)

Scripts are in `.claude/skills/performance-check/scripts/` and output compact JSON — Claude parses and summarises them; raw JSON never enters the context.

---

## When to invoke

Triggered by: `/lighthouse`, "run a11y audit", "check performance", "WCAG scan", "accessibility check", "lighthouse audit".

---

## Steps

### 1 — Determine target

**Ask the user** which version to audit:

> "Which version do you want to audit?"
>
> - **Dev server** — starts `pnpm dev` (or reuses it if already running); runs Lighthouse + axe-core over HTTP.
> - **Static build** — uses the `dist-static/` single-file build; runs axe-core only (Lighthouse requires HTTP).

Use `ask_user` with choices `["Dev server (Lighthouse + axe-core)", "Static build (axe-core only)"]`.

---

#### If the user chooses **Dev server**

Check whether `pnpm dev` is already serving on port 5173:

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173 2>/dev/null || echo "offline"
```

- **If 200** → server is already up, proceed.
- **If offline** → start the dev server as a background process and wait up to 30 s for it to become ready:

  ```bash
  pnpm dev &
  DEV_PID=$!
  for i in $(seq 1 30); do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173 2>/dev/null)
    [ "$STATUS" = "200" ] && break
    sleep 1
  done
  echo "server_status:$STATUS"
  ```

  If it never responds with 200 after 30 s, report the error and stop.

Set `TARGET_URL=http://localhost:5173`.

Ask the user if they want `desktop` (default) or `mobile` form factor for Lighthouse.

---

#### If the user chooses **Static build**

Check whether the build is **fresh**: `apps/sunfest2027/dist-static/index.html` must exist **and** be newer than the most recently modified file under `apps/sunfest2027/src/` (any file: `.ts`, `.tsx`, `.css`, `.json`, etc.).

On Unix/macOS:

```bash
APP="apps/sunfest2027"
STATIC="$APP/dist-static/index.html"
if [ ! -f "$STATIC" ]; then
  echo "STALE: missing"
else
  NEWEST_SRC=$(find "$APP/src" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.css" -o -name "*.json" \) -newer "$STATIC" | head -1)
  if [ -n "$NEWEST_SRC" ]; then echo "STALE: $NEWEST_SRC"; else echo "FRESH"; fi
fi
```

On Windows (PowerShell):

```powershell
$app = "apps\sunfest2027"
$static = "$app\dist-static\index.html"
if (-not (Test-Path $static)) { "STALE: missing" }
else {
  $buildTime = (Get-Item $static).LastWriteTime
  $newer = Get-ChildItem "$app\src" -Recurse -Include *.ts,*.tsx,*.css,*.json |
           Where-Object { $_.LastWriteTime -gt $buildTime } | Select-Object -First 1
  if ($newer) { "STALE: $($newer.FullName)" } else { "FRESH" }
}
```

- **If FRESH** → proceed with the existing build.
- **If STALE** → inform the user which file triggered the rebuild, then run:

  ```bash
  pnpm build:static
  ```

  Wait for it to complete (allow up to 120 s). If it fails, report the error and stop.

Set `TARGET_URL=file:///$(pwd)/apps/sunfest2027/dist-static/index.html` (on Windows use the full absolute path with forward slashes: `file:///Z:/Github/eclipse-con/apps/sunfest2027/dist-static/index.html`).

> ⚠️ Lighthouse is **skipped** for static builds — note this clearly in the report.

### 2 — Run scans (parallel)

Create the temp output directory (gitignored), then launch both scripts simultaneously:

```bash
mkdir -p .audit
```

> **Resuming after a partial run:** if `.audit/axe-checkpoint.json` exists, `axe-scan.mjs` will automatically skip already-completed routes and continue from where it left off. If `.audit/lh-result.json` already contains a valid result, `lh-scan.mjs` will output it immediately without re-running Lighthouse. Pass `--force` to `lh-scan.mjs` to discard the cache and run fresh.

**For HTTP targets — both scans in parallel:**

```bash
node .claude/skills/performance-check/scripts/axe-scan.mjs "$TARGET_URL" --routes root \
  > .audit/axe-result.json 2>.audit/axe-err.txt &
AXE_PID=$!

node .claude/skills/performance-check/scripts/lh-scan.mjs "$TARGET_URL" "desktop" \
  > .audit/lh-result.json 2>.audit/lh-err.txt &
LH_PID=$!

wait $AXE_PID; AXE_EXIT=$?
wait $LH_PID;  LH_EXIT=$?
echo "axe:$AXE_EXIT lh:$LH_EXIT"
```

**For file:// targets — axe-core only:**

```bash
node .claude/skills/performance-check/scripts/axe-scan.mjs "$TARGET_URL" --routes root \
  > .audit/axe-result.json 2>.audit/axe-err.txt
echo "axe:$?"
```

If any exit code is non-zero, read the matching `/tmp/*-err.txt` file and report the error to the user before continuing.

### 3 — Parse results (minimal context)

Read only what you need:

```bash
# Lighthouse scores + top issues
node -e "
const d = JSON.parse(require('fs').readFileSync('.audit/lh-result.json','utf8'));
const out = { scores: d.scores, topIssues: d.topIssues.slice(0,12), opportunities: d.opportunities };
console.log(JSON.stringify(out));
" 2>/dev/null || echo "LH_SKIPPED"
```

```bash
# axe summary + violations
node -e "
const d = JSON.parse(require('fs').readFileSync('.audit/axe-result.json','utf8'));
const out = { summary: d.summary, totalViolations: d.totalViolations, scanned: d.scanned, violations: d.violations };
console.log(JSON.stringify(out));
"
```

### 4 — Render report

Output a structured markdown report. Keep it concise — show scores, call out critical/serious issues, and group fixes by category.

### 5 — Save report

After rendering the report in the conversation, write the exact same markdown content to `.audit/report.md` using the `create` or `edit` tool (overwrite if it already exists). Confirm to the user where the file was saved.

---

## Report format

```markdown
## Audit Report — Sunfest 2027

**Target:** `<url>` | **Date:** <date> | **Form factor:** desktop/mobile

---

### Lighthouse Scores

| Category       | Score | Status   |
| -------------- | ----- | -------- |
| Performance    | XX    | 🟢/🟡/🔴 |
| Accessibility  | XX    | ...      |
| Best Practices | XX    | ...      |
| SEO            | XX    | ...      |

> 🟢 ≥ 90 🟡 50–89 🔴 < 50

---

### Top Lighthouse Issues

Group by category. For each issue: `id`, score, display value, one-line description.
Show opportunities (time savings in ms) in a separate sub-section.

---

### Axe-Core WCAG 2.1 AA

**Scanned:** `/`
**Violations:** X critical · Y serious · Z moderate · W minor

For each violation (sorted critical → minor):

- **`rule-id`** [impact] — description
  - Count: N nodes · Routes: /foo, /bar
  - Example selector: `button.cta > span`
  - Fix: one-sentence actionable advice
  - Docs: <helpUrl>

---

### Summary & Priorities

Numbered list of the 5 most impactful fixes across both scans.
```

Score status emoji thresholds: 🟢 ≥ 90 · 🟡 50–89 · 🔴 < 50.

---

## Rules

- Never dump raw JSON into the conversation — always parse and summarise.
- Lighthouse requires HTTP. If target is `file://`, skip Lighthouse and note it clearly.
- If the dev server is offline, do not attempt to start it automatically — ask the user.
- Consent is pre-set in axe-scan.mjs so the tracking popup doesn't block the scan.
- Both scans run in parallel for HTTP targets to keep total time under 90 seconds.

---

## Resuming after failure

Both scripts write progress to disk immediately so a crashed or interrupted run can resume.

### Checkpoint files

| File                         | Created by     | Meaning                                                                                                                                                   |
| ---------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.audit/axe-checkpoint.json` | `axe-scan.mjs` | Per-route progress. Updated after every route. Deleted once findings are written.                                                                         |
| `.audit/axe-findings.json`   | `axe-scan.mjs` | **Full findings document** — all violations with uncapped node selectors, route breakdown, summary. Written on successful completion.                     |
| `.audit/lh-findings.json`    | `lh-scan.mjs`  | **Full findings document** — all failing audits (no slice limit), all opportunities with raw `details`, passing audits. Written on successful completion. |
| `.audit/lh-status.json`      | `lh-scan.mjs`  | Written before Lighthouse starts (`status: "running"`); updated to `status: "done"` on completion.                                                        |
| `.audit/lh-result.json`      | shell redirect | Summarised Lighthouse output (top 20 issues, top 8 opportunities). If present and valid, `lh-scan.mjs` reuses it automatically.                           |
| `.audit/axe-result.json`     | shell redirect | Summarised axe output. If present it means axe completed successfully.                                                                                    |

> **Findings vs result files:** `*-findings.json` files contain full, uncapped data intended for downstream agents and skills. `*-result.json` files are the summarised versions used by Claude to generate the report (kept small to avoid flooding the context window).

### How to resume

**axe-scan crashed mid-way:**

```bash
# Just re-run the same command — the checkpoint is picked up automatically
node .claude/skills/performance-check/scripts/axe-scan.mjs "$TARGET_URL" --routes root \
  > .audit/axe-result.json 2>.audit/axe-err.txt
```

**Lighthouse crashed or result is stale:**

```bash
# Pass --force to discard the cached result and re-run Lighthouse
node .claude/skills/performance-check/scripts/lh-scan.mjs "$TARGET_URL" "desktop" --force \
  > .audit/lh-result.json 2>.audit/lh-err.txt
```

**Start completely fresh (wipe all intermediate state):**

```bash
rm -rf .audit && mkdir .audit
```
