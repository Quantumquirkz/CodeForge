"""Helpers for handling action confirmation commands."""

from __future__ import annotations

from app.memory.session_store import SessionStore
from app.policy.action_guard import ActionGuard


def handle_confirmation_command(
    session_id: str,
    text: str,
    session_store: SessionStore,
    action_guard: ActionGuard,
) -> tuple[bool, str]:
    """Process confirm/cancel commands for pending actions.

    Returns:
        tuple[bool, str]: (handled, response_message)
    """
    command = text.strip().lower()
    pending_action = session_store.get_pending_action(session_id)

    if not pending_action:
        return False, ""

    if command == f"confirm {pending_action.action_id}".lower():
        result = action_guard.execute(pending_action)
        session_store.clear_pending_action(session_id)
        return True, result

    if command == f"cancel {pending_action.action_id}".lower():
        session_store.clear_pending_action(session_id)
        return True, "Understood. I cancelled the pending action."

    return False, ""
