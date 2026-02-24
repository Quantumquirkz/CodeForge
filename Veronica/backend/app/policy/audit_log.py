"""Action audit logging for sensitive operations.

This module provides a lightweight JSONL audit trail for confirmation-driven
actions (confirmed/cancelled). It is designed as a local baseline that can be
replaced with a centralized audit sink later.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass
from datetime import datetime, timezone
import json
from pathlib import Path

from app.core.config import settings


@dataclass(slots=True)
class ActionAuditEvent:
    """Represents one auditable action event."""

    session_id: str
    action_id: str
    action_type: str
    status: str
    timestamp_utc: str


class ActionAuditLogger:
    """Writes action audit events to a JSONL file."""

    def __init__(self, log_path: str) -> None:
        self._path = Path(log_path)
        self._path.parent.mkdir(parents=True, exist_ok=True)

    def log(self, event: ActionAuditEvent) -> None:
        """Append a serialized event to the configured JSONL log."""
        with self._path.open("a", encoding="utf-8") as file_handle:
            file_handle.write(json.dumps(asdict(event), ensure_ascii=False) + "\n")



def build_audit_event(
    session_id: str,
    action_id: str,
    action_type: str,
    status: str,
) -> ActionAuditEvent:
    """Create an event stamped with UTC time in ISO format."""
    return ActionAuditEvent(
        session_id=session_id,
        action_id=action_id,
        action_type=action_type,
        status=status,
        timestamp_utc=datetime.now(timezone.utc).isoformat(),
    )


action_audit_logger = ActionAuditLogger(settings.ACTION_AUDIT_LOG_PATH)
