# deploy-static skill

Build the static single-file HTML artifact and optionally deploy it to the local network share.

## Steps

### 1. Ask the user which version to serve

Ask the user:

> "Would you like to test against the **dev server** or the **static build**?"
>
> - **Dev server** — Vite serves the app live at `http://localhost:5173`.
> - **Static build** — uses `pnpm build:static` to produce `dist-static/index.html` (a single self-contained file). The build will be skipped if the artifact is already up-to-date.

Choices: `["Dev server", "Static build (auto-detect freshness)"]`

---

### 2a. Dev server path

Start the Vite dev server:

```powershell
pnpm dev
```

Wait until the server is ready (`Local: http://localhost:5173`), then continue with the audit / performance check against `http://localhost:5173`.

---

### 2b. Static build path

**Freshness check** — the static build is considered _stale_ when any source file is newer than `dist-static/index.html`.

```powershell
$artifact = "dist-static\index.html"
$stale = $false
if (-not (Test-Path $artifact)) {
    $stale = $true
} else {
    $artifactTime = (Get-Item $artifact).LastWriteTime
    $newer = Get-ChildItem -Recurse src, public, index.html `
        | Where-Object { $_.LastWriteTime -gt $artifactTime }
    if ($newer) { $stale = $true }
}
Write-Host ($stale ? "STALE - rebuild required" : "FRESH - skipping build")
```

If stale, run:

```powershell
pnpm build:static
```

This produces `dist-static/index.html`.

**Deploy to network share** — if the `P:` drive is mounted, copy the artifact there:

```powershell
if (Test-Path "P:\") {
    Copy-Item "dist-static\index.html" "P:\Public Folder\index.html" -Force
    Write-Host "Deployed to P:\Public Folder\index.html"
} else {
    Write-Host "P: drive not found — skipping network copy"
}
```

---

### 3. Commit & push (if requested)

After building, stage any changed files and commit with a conventional message:

```
chore: build static artifact
```

Then push.

---

### 4. Verify

Confirm the deployed file path and size to the user. If a dev server was started, confirm the URL.
