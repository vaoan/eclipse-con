$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
& node (Join-Path $scriptDir "apps/moonfest2026/scripts/sync-telegram.mjs") @args
exit $LASTEXITCODE
