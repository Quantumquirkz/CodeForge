"""Plugin registry: stores approved generated tools."""

from pathlib import Path
from typing import Any, Callable

import json

from app.core.config import settings

_PLUGINS: dict[str, Callable[..., str]] = {}
_PLUGIN_DIR = Path(settings.plugins_dir)
_PLUGIN_DIR.mkdir(parents=True, exist_ok=True)


def register_plugin(name: str, fn: Callable[..., str]) -> None:
    """Register an approved plugin."""
    _PLUGINS[name] = fn


def unregister_plugin(name: str) -> None:
    """Remove a plugin."""
    _PLUGINS.pop(name, None)


def get_plugin(name: str) -> Callable[..., str] | None:
    """Get plugin by name."""
    return _PLUGINS.get(name)


def list_plugins() -> list[str]:
    """List registered plugin names."""
    return list(_PLUGINS.keys())


def execute_plugin(name: str, **kwargs: Any) -> str:
    """Execute a plugin and return result."""
    fn = get_plugin(name)
    if fn is None:
        return f"Plugin '{name}' no encontrado."
    return fn(**kwargs)


def save_plugin_to_disk(name: str, code: str) -> None:
    """Persist plugin code to disk."""
    path = _PLUGIN_DIR / f"{name}.py"
    path.write_text(code, encoding="utf-8")


def load_plugin_from_disk(name: str) -> str | None:
    """Load plugin code from disk."""
    path = _PLUGIN_DIR / f"{name}.py"
    if not path.exists():
        return None
    return path.read_text(encoding="utf-8")
