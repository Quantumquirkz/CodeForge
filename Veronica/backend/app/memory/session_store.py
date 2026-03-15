"""In-memory session store (Phase 1). Persistence can be added later."""

from typing import Any

_sessions: dict[str, dict[str, Any]] = {}


def get_session(session_id: str) -> dict[str, Any]:
    """Get or create session."""
    if session_id not in _sessions:
        _sessions[session_id] = {"history": [], "pending_action": None}
    return _sessions[session_id]


def set_pending_action(session_id: str, action: dict[str, Any] | None) -> None:
    """Set pending action for confirmation."""
    s = get_session(session_id)
    s["pending_action"] = action


def get_pending_action(session_id: str) -> dict[str, Any] | None:
    """Get pending action if any."""
    return get_session(session_id).get("pending_action")
