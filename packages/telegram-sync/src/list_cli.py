import io
import json
import os
import sys
from pathlib import Path
from list_messages import render

# Ensure stdout can handle Unicode (emojis in message previews) on Windows
# consoles whose default codepage (e.g. cp1252) can't encode them directly.
if sys.stdout.encoding and sys.stdout.encoding.lower() not in ("utf-8", "utf8"):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

out_dir = Path(os.environ["TELEGRAM_OUT_DIR"]).resolve()
path = out_dir / "messages.json"
archive = json.loads(path.read_text(encoding="utf-8")) if path.exists() else {"messages": []}
print(render(archive, int(os.environ.get("TELEGRAM_LIST_LIMIT", "40"))))
