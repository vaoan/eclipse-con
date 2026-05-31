$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
& node (Join-Path $scriptDir "scripts/sync-telegram.mjs") @args
exit $LASTEXITCODE
