import unittest
from datetime import datetime, timezone
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent / "src"))
from selection import keep  # noqa: E402


def msg(id, text="hello", when="2026-01-10T00:00:00+00:00"):
    return {"id": id, "text": text, "date": datetime.fromisoformat(when)}


SINCE = datetime(2026, 1, 1, tzinfo=timezone.utc)
EMPTY = {"includeIds": [], "excludeIds": [], "includeKeywords": [], "excludeKeywords": []}


class TestKeep(unittest.TestCase):
    def test_excludeId_wins_over_everything(self):
        rules = {**EMPTY, "excludeIds": [5], "includeIds": [5], "includeKeywords": ["hello"]}
        self.assertFalse(keep(msg(5), rules, SINCE))

    def test_includeId_bypasses_window(self):
        old = msg(7, when="2020-01-01T00:00:00+00:00")
        self.assertTrue(keep(old, {**EMPTY, "includeIds": [7]}, SINCE))

    def test_excludeKeyword_drops_in_window_message(self):
        rules = {**EMPTY, "excludeKeywords": ["sunfest"]}
        self.assertFalse(keep(msg(8, text="Big SUNFEST promo"), rules, SINCE))

    def test_includeKeyword_pulls_in(self):
        rules = {**EMPTY, "includeKeywords": ["#pin"]}
        old = msg(9, text="please #pin", when="2020-01-01T00:00:00+00:00")
        self.assertTrue(keep(old, rules, SINCE))

    def test_window_default_in_and_out(self):
        self.assertTrue(keep(msg(10, when="2026-02-01T00:00:00+00:00"), EMPTY, SINCE))
        self.assertFalse(keep(msg(11, when="2025-12-01T00:00:00+00:00"), EMPTY, SINCE))

    def test_no_since_keeps_all_undecided(self):
        self.assertTrue(keep(msg(12, when="1999-01-01T00:00:00+00:00"), EMPTY, None))

    def test_keyword_case_insensitive_substring(self):
        self.assertFalse(keep(msg(13, text="SuNFeSt"), {**EMPTY, "excludeKeywords": ["sunfest"]}, SINCE))
