"""Approval gate for generated plugins."""

from typing import Any

from app.core.config import settings
from app.memory.session_store import get_session
from app.policy.audit_log import log_plugin_approval, log_tool_generation_request


def check_tool_generation_limit(session_id: str) -> bool:
    """Check if session has exceeded max tools per session."""
    s = get_session(session_id)
    count = s.get("tool_generation_count", 0)
    return count < settings.max_tools_per_session


def increment_tool_generation_count(session_id: str) -> None:
    """Increment tool generation count for session."""
    s = get_session(session_id)
    s["tool_generation_count"] = s.get("tool_generation_count", 0) + 1


def request_tool_generation(session_id: str, description: str) -> dict[str, Any]:
    """Record tool generation request and return approval status."""
    log_tool_generation_request(session_id, description)
    if not check_tool_generation_limit(session_id):
        return {"allowed": False, "reason": "Límite de herramientas por sesión alcanzado."}
    increment_tool_generation_count(session_id)
    return {"allowed": True}


def approve_plugin(session_id: str, plugin_name: str, code: str) -> bool:
    """Record plugin approval. Caller must register plugin separately."""
    log_plugin_approval(session_id, plugin_name, approved=True)
    return True


def reject_plugin(session_id: str, plugin_name: str) -> None:
    """Record plugin rejection."""
    log_plugin_approval(session_id, plugin_name, approved=False)
