from pathlib import Path


def test_no_merge_conflict_markers_in_critical_files() -> None:
    tracked_files = [
        Path("app/api/endpoints.py"),
        Path("app/memory/session_store.py"),
        Path("app/models/chat.py"),
    ]
    markers = ("<<<<<<<", "=======", ">>>>>>>")

    for file_path in tracked_files:
        content = file_path.read_text(encoding="utf-8")
        assert all(marker not in content for marker in markers), (
            f"Merge conflict markers found in {file_path}"
        )
