"""Append-only archive merge keyed by (source, id). Never removes entries."""
from datetime import datetime


def _key(entry: dict, default_source: str):
    """Build the dedup key for an entry as (source, id), falling back to the given default source."""
    return (entry.get("source", default_source), int(entry["id"]))


def merge(existing: list[dict], new: list[dict], source: str) -> list[dict]:
    """Union existing + new, keyed by (source, id); existing wins on conflict.

    New entries are stamped with `source`. Nothing is ever removed. Result is
    sorted by date desc, then id desc.
    """
    combined: dict = {}
    for entry in existing:
        combined[_key(entry, source)] = entry
    for entry in new:
        stamped = {**entry, "source": entry.get("source", source)}
        combined.setdefault(_key(stamped, source), stamped)
    return sorted(
        combined.values(),
        key=lambda m: (datetime.fromisoformat(str(m["date"])), int(m["id"])),
        reverse=True,
    )
