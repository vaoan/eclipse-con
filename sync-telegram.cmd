@echo off
setlocal
node "%~dp0packages\telegram-sync\bin\sync.mjs" sync --config "%~dp0apps\moonfest2026\telegram.config.json" %*
