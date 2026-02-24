"""Helpers for handling action confirmation commands."""

from __future__ import annotations

from dataclasses import dataclass

from app.memory.session_store import SessionStore
from app.policy.action_guard import ActionGuard
from app.policy.audit_log import ActionAuditLogger, action_audit_logger, build_audit_event


@dataclass(slots=True)
class ConfirmationCommandResult:
    """Structured outcome of a confirmation command check."""

    handled: bool
    response_message: str


def handle_confirmation_command(
    session_id: str,
    text: str,
    session_store: SessionStore,
    action_guard: ActionGuard,
    audit_logger: ActionAuditLogger | None = None,
) -> ConfirmationCommandResult:
    """Process confirm/cancel commands for pending actions."""
    command = text.strip().lower()
    pending_action = session_store.get_pending_action(session_id)

    if not pending_action:
        return ConfirmationCommandResult(handled=False, response_message="")

    logger = audit_logger or action_audit_logger

    if command == f"confirm {pending_action.action_id}".lower():
        result = action_guard.execute(pending_action)
        session_store.clear_pending_action(session_id)
        logger.log(
            build_audit_event(
                session_id=session_id,
                action_id=pending_action.action_id,
                action_type=pending_action.action_type,
                status="confirmed",
            )
        )
        return ConfirmationCommandResult(handled=True, response_message=result)

    if command == f"cancel {pending_action.action_id}".lower():
        session_store.clear_pending_action(session_id)
        logger.log(
            build_audit_event(
                session_id=session_id,
                action_id=pending_action.action_id,
                action_type=pending_action.action_type,
                status="cancelled",
            )
        )
        return ConfirmationCommandResult(
            handled=True,
            response_message="Understood. I cancelled the pending action.",
        )

    return ConfirmationCommandResult(handled=False, response_message="")
