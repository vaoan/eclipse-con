"""Curation aid: print recent messages as `id — date — preview` lines."""


def render(archive: dict, limit: int = 40) -> str:
    """Render up to `limit` messages from the archive as preview lines."""
    lines = []
    for m in archive.get("messages", [])[:limit]:
        text = (m.get("text") or "").replace("\n", " ").strip()
        preview = (text[:70] + "…") if len(text) > 70 else text
        lines.append(f"{m['id']} — {m.get('date', '')} — {preview}")
    return "\n".join(lines)
