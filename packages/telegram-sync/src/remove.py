"""Manual, explicit removal of an archived message (the only deletion path)."""


def drop(archive: dict, message_id: int) -> dict:
    """Return a copy of the archive with the given message id removed."""
    kept = [m for m in archive.get("messages", []) if int(m["id"]) != int(message_id)]
    return {**archive, "messages": kept}
