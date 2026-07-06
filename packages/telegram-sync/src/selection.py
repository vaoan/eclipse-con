"""Deterministic ingest gate: decide whether a fetched message enters a feed."""
from datetime import datetime


def keep(message: dict, rules: dict, since_dt: datetime | None) -> bool:
    """Return True if the message should be ingested, per fixed precedence.

    Order (first match wins): excludeIds → includeIds → excludeKeywords →
    includeKeywords → date window (since_dt). With no since_dt, undecided
    messages are kept.
    """
    mid = int(message["id"])
    text = (message.get("text") or "").lower()

    if mid in set(rules.get("excludeIds", [])):
        return False
    if mid in set(rules.get("includeIds", [])):
        return True
    if any(kw.lower() in text for kw in rules.get("excludeKeywords", [])):
        return False
    if any(kw.lower() in text for kw in rules.get("includeKeywords", [])):
        return True
    if since_dt is None:
        return True
    return message["date"] >= since_dt
