@echo off
setlocal
call pnpm --filter moonfest2026 sync:telegram %*
