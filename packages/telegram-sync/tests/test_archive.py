import unittest, sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent / "src"))
from archive import merge  # noqa: E402


def e(id, date, source=None):
    d = {"id": id, "date": date, "text": f"m{id}", "media": []}
    if source is not None:
        d["source"] = source
    return d


class TestMerge(unittest.TestCase):
    def test_appends_new_and_keeps_existing(self):
        existing = [e(1, "2026-01-01T00:00:00+00:00")]
        new = [e(2, "2026-01-02T00:00:00+00:00")]
        out = merge(existing, new, "t.me/A")
        self.assertEqual([m["id"] for m in out], [2, 1])  # date desc

    def test_never_removes_existing_even_if_not_in_new(self):
        existing = [e(1, "2026-01-01T00:00:00+00:00"), e(2, "2026-01-02T00:00:00+00:00")]
        out = merge(existing, [], "t.me/A")
        self.assertEqual({m["id"] for m in out}, {1, 2})

    def test_dedup_by_source_and_id(self):
        existing = [e(1, "2026-01-01T00:00:00+00:00", source="t.me/A")]
        new = [e(1, "2026-01-01T00:00:00+00:00")]  # same source+id
        out = merge(existing, new, "t.me/A")
        self.assertEqual(len(out), 1)

    def test_same_id_different_source_coexist(self):
        existing = [e(1, "2026-01-01T00:00:00+00:00", source="t.me/A")]
        new = [e(1, "2026-01-03T00:00:00+00:00")]  # id 1 but source t.me/B
        out = merge(existing, new, "t.me/B")
        self.assertEqual(len(out), 2)

    def test_new_entries_stamped_with_source(self):
        out = merge([], [e(9, "2026-01-01T00:00:00+00:00")], "t.me/B")
        self.assertEqual(out[0]["source"], "t.me/B")
