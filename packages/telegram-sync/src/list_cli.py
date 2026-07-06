import json, os
from pathlib import Path
from list_messages import render

out_dir = Path(os.environ["TELEGRAM_OUT_DIR"]).resolve()
path = out_dir / "messages.json"
archive = json.loads(path.read_text(encoding="utf-8")) if path.exists() else {"messages": []}
print(render(archive, int(os.environ.get("TELEGRAM_LIST_LIMIT", "40"))))
