"""Base tool interface for Veronica."""

from typing import Any


def run(**kwargs: Any) -> str:
    """Standard tool interface. Override in concrete tools."""
    return "Tool not implemented"
