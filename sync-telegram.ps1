$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
& node (Join-Path $scriptDir "packages/telegram-sync/bin/sync.mjs") sync --config (Join-Path $scriptDir "apps/moonfest2026/telegram.config.json") @args
exit $LASTEXITCODE
