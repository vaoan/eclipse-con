import io
import json
import os
import sys
from pathlib import Path
from remove import drop

# Ensure stdout can handle Unicode on Windows consoles whose default codepage
# (e.g. cp1252) can't encode message content directly.
if sys.stdout.encoding and sys.stdout.encoding.lower() not in ("utf-8", "utf8"):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

out_dir = Path(os.environ["TELEGRAM_OUT_DIR"]).resolve()
path = out_dir / "messages.json"
message_id = int(sys.argv[1])
archive = json.loads(path.read_text(encoding="utf-8"))
updated = drop(archive, message_id)
path.write_text(json.dumps(updated, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"Removed message {message_id} from {path}")
