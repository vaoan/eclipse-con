import unittest, sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent / "src"))
from remove import drop  # noqa: E402


class TestDrop(unittest.TestCase):
    def test_removes_only_target_id(self):
        arc = {"messages": [{"id": 1, "text": "a"}, {"id": 2, "text": "b"}]}
        out = drop(arc, 1)
        self.assertEqual([m["id"] for m in out["messages"]], [2])

    def test_missing_id_is_noop(self):
        arc = {"messages": [{"id": 2, "text": "b"}]}
        self.assertEqual(len(drop(arc, 99)["messages"]), 1)
