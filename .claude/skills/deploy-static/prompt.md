# deploy-static skill

Fully unattended: always does a static build, fixes all issues, commits, pushes, and copies to the network share if available. Never asks the user anything.

## Steps

### 1. Freshness check

The static build is considered _stale_ when any source file is newer than `dist-static/index.html`.

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

### 2. Build (if stale)

Run the static build. If it fails, diagnose and fix the issue automatically, then retry — never skip or ask:

```powershell
pnpm build:static
```

This produces `dist-static/index.html`.

### 3. Commit & push

Stage all modified tracked files and commit. Use a conventional commit message that reflects what changed (e.g. includes the app version if it was bumped). Always include the Co-authored-by trailer. Then push:

```powershell
git add -u
git commit -m "chore: build static artifact

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
git push
```

> Note: `dist-static/` is gitignored — do NOT try to stage the artifact itself.

### 4. Deploy to network share

If the `P:` drive is mounted, copy the artifact there automatically:

```powershell
if (Test-Path "P:\") {
    Copy-Item "dist-static\index.html" "P:\Public Folder\index.html" -Force
    Write-Host "Deployed to P:\Public Folder\index.html"
} else {
    Write-Host "P: drive not found — skipping network copy"
}
```

### 5. Verify

Report the artifact path, file size in MB, and whether the network copy was made.
