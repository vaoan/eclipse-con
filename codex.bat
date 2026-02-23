@echo off
setlocal

set "SCRIPT_DIR=%~dp0"
set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"
set "CODEX_HOME=%SCRIPT_DIR%\.claude"
set "CLAUDE_CONFIG_DIR=%CODEX_HOME%"

if not exist "%CODEX_HOME%" mkdir "%CODEX_HOME%"

if not exist "%CODEX_HOME%\config.toml" (
  if exist "%USERPROFILE%\.codex\config.toml" (
    copy /y "%USERPROFILE%\.codex\config.toml" "%CODEX_HOME%\config.toml" >NUL
  ) else (
    > "%CODEX_HOME%\config.toml" echo model = ^"gpt-5.2-codex^"
    >> "%CODEX_HOME%\config.toml" echo model_reasoning_effort = ^"medium^"
    >> "%CODEX_HOME%\config.toml" echo.
    >> "%CODEX_HOME%\config.toml" echo [mcp_servers.figma]
    >> "%CODEX_HOME%\config.toml" echo url = ^"https://mcp.figma.com/mcp^"
  )
)
findstr /c:"[mcp_servers.figma]" "%CODEX_HOME%\config.toml" >NUL
if errorlevel 1 (
  >> "%CODEX_HOME%\config.toml" echo.
  >> "%CODEX_HOME%\config.toml" echo [mcp_servers.figma]
  >> "%CODEX_HOME%\config.toml" echo url = ^"https://mcp.figma.com/mcp^"
)

set "CODEX_BIN="
for /f "delims=" %%I in ('where codex.cmd 2^>NUL') do set "CODEX_BIN=%%I" & goto :run
for /f "delims=" %%I in ('where codex.exe 2^>NUL') do set "CODEX_BIN=%%I" & goto :run

echo Codex CLI not found in PATH. Install it or add it to PATH, then rerun.
goto :eof

:run
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "Start-Process -Verb RunAs -FilePath 'cmd.exe' -WorkingDirectory '%SCRIPT_DIR%' -ArgumentList '/k','cd /d %SCRIPT_DIR% && set CODEX_HOME=%CODEX_HOME% && set CLAUDE_CONFIG_DIR=%CLAUDE_CONFIG_DIR% && call \"%CODEX_BIN%\" --dangerously-bypass-approvals-and-sandbox'"

endlocal
