from pathlib import Path


<<<<<<< HEAD
EXCLUDED_DIRS = {
    ".git",
    "node_modules",
    ".next",
    "dist",
    "build",
    "__pycache__",
    ".pytest_cache",
}


def test_no_merge_conflict_markers_in_veronica_repository() -> None:
    """Ensure no merge markers exist in source files under Veronica/."""
    repo_root = Path(__file__).resolve().parents[2]
    markers = ("<" * 7, "=" * 7, ">" * 7)

    for path in repo_root.rglob("*"):
        if not path.is_file():
            continue

        if any(part in EXCLUDED_DIRS for part in path.parts):
            continue

        if path.suffix.lower() in {".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".lock"}:
            continue

        try:
            content = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue

        assert all(marker not in content for marker in markers), (
            f"Merge conflict markers found in {path}"
=======
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
>>>>>>> main
        )
