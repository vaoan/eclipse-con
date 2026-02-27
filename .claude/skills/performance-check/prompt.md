# Lighthouse & Accessibility Audit

Runs a full audit of the eclipse-con SPA: **Lighthouse** (Performance · Accessibility · Best-Practices · SEO) plus **axe-core WCAG 2.1 AA** runtime scan on all pages.

Scripts are in `.claude/skills/performance-check/scripts/` and output compact JSON — Claude parses and summarises them; raw JSON never enters the context.

---

## When to invoke

Triggered by: `/lighthouse`, "run a11y audit", "check performance", "WCAG scan", "accessibility check", "lighthouse audit".

---

## Steps

### 1 — Determine target

Check whether `pnpm dev` is already serving on port 5173:

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173 2>/dev/null || echo "offline"
```

- **If 200** → `TARGET_URL=http://localhost:5173` — run both Lighthouse + axe-core.
- **If offline** → check if `dist-static/index.html` exists:
  - If yes → `TARGET_URL=file:///$(pwd)/dist-static/index.html` — run axe-core only (Lighthouse requires HTTP).
  - If no → tell the user to run `pnpm dev` or `pnpm build:static` first and stop.

Ask the user if they want `desktop` (default) or `mobile` form factor for Lighthouse.

### 2 — Run scans (parallel)

Create the temp output directory (gitignored), then launch both scripts simultaneously:

```bash
mkdir -p .audit
```

**For HTTP targets — both scans in parallel:**

```bash
node .claude/skills/performance-check/scripts/axe-scan.mjs "$TARGET_URL" --routes root,/registration-tutorial \
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
node .claude/skills/performance-check/scripts/axe-scan.mjs "$TARGET_URL" --routes root,/registration-tutorial \
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

---

## Report format

```markdown
## Audit Report — eclipse-con

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

**Scanned:** `/`, `/registration-tutorial`
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
