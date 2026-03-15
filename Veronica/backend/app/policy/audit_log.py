"""Audit log for actions and plugin approvals."""

import json
from datetime import datetime
from pathlib import Path

from app.core.config import settings


def _ensure_log_dir():
    path = Path(settings.action_audit_log_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    return path


def _append_log(event: dict) -> None:
    """Append event to JSONL audit log."""
    path = _ensure_log_dir()
    event["timestamp"] = datetime.utcnow().isoformat()
    with open(path, "a", encoding="utf-8") as f:
        f.write(json.dumps(event, ensure_ascii=False) + "\n")


def log_action_confirmed(session_id: str, action_type: str) -> None:
    """Log confirmed action (no sensitive data)."""
    _append_log({
        "event": "action_confirmed",
        "session_id": session_id,
        "action_type": action_type,
    })


def log_action_cancelled(session_id: str, action_type: str) -> None:
    """Log cancelled action."""
    _append_log({
        "event": "action_cancelled",
        "session_id": session_id,
        "action_type": action_type,
    })


def log_tool_generation_request(session_id: str, description: str) -> None:
    """Log tool generation request."""
    _append_log({
        "event": "tool_generation_request",
        "session_id": session_id,
        "description_preview": description[:200] if description else "",
    })


def log_plugin_approval(session_id: str, plugin_name: str, approved: bool) -> None:
    """Log plugin approval or rejection."""
    _append_log({
        "event": "plugin_approval",
        "session_id": session_id,
        "plugin_name": plugin_name,
        "approved": approved,
    })
