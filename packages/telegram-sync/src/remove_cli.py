import json, os, sys
from pathlib import Path
from remove import drop

out_dir = Path(os.environ["TELEGRAM_OUT_DIR"]).resolve()
path = out_dir / "messages.json"
message_id = int(sys.argv[1])
archive = json.loads(path.read_text(encoding="utf-8"))
updated = drop(archive, message_id)
path.write_text(json.dumps(updated, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"Removed message {message_id} from {path}")
