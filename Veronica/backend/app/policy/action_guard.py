"""Policy guard for high-impact tool actions.

This module introduces an explicit confirmation step for side-effect actions so
that users can review and approve operations before execution.
"""

from __future__ import annotations

from dataclasses import dataclass
import re
from typing import Any
from uuid import uuid4

from app.tools.base import control_lights, prepare_crypto_transfer, send_email


@dataclass(slots=True)
class PendingAction:
    """Represents a tool action awaiting explicit user confirmation."""

    action_id: str
    action_type: str
    arguments: dict[str, Any]
    preview_message: str


@dataclass(slots=True)
class ConfirmationResult:
    """Outcome of evaluating a user message against action policies."""

    requires_confirmation: bool
    response_message: str
    pending_action: PendingAction | None = None


class ActionGuard:
    """Detects risky operations and enforces a confirm-before-execute policy."""

    LIGHTS_PATTERN = re.compile(
        r"\bturn\s+(?P<state>on|off)\s+the\s+lights\s+in\s+the\s+(?P<room>[a-zA-Z\s]+)",
        re.IGNORECASE,
    )
    EMAIL_PATTERN = re.compile(
        r"\bsend\s+(an\s+)?email\s+to\s+(?P<recipient>[^,]+),\s*subject\s*:\s*(?P<subject>[^,]+),\s*body\s*:\s*(?P<body>.+)",
        re.IGNORECASE,
    )
    CRYPTO_TRANSFER_PATTERN = re.compile(
        r"\b(send|transfer)\s+(?P<amount>\d+(?:\.\d+)?)\s*eth\s+to\s+(?P<address>0x[a-fA-F0-9]{40})",
        re.IGNORECASE,
    )

    def evaluate(self, text: str) -> ConfirmationResult:
        """Check whether a message should create a pending action."""
        lights_match = self.LIGHTS_PATTERN.search(text)
        if lights_match:
            state = lights_match.group("state").lower().strip()
            room = lights_match.group("room").strip()
            action_id = str(uuid4())
            pending_action = PendingAction(
                action_id=action_id,
                action_type="control_lights",
                arguments={"room": room, "state": state},
                preview_message=f"Turn {state} the lights in the {room}",
            )
            return ConfirmationResult(
                requires_confirmation=True,
                response_message=(
                    f"I can do that. Please reply with `confirm {action_id}` to proceed or `cancel {action_id}` to stop. "
                    f"Planned action: {pending_action.preview_message}."
                ),
                pending_action=pending_action,
            )

        email_match = self.EMAIL_PATTERN.search(text)
        if email_match:
            recipient = email_match.group("recipient").strip()
            subject = email_match.group("subject").strip()
            body = email_match.group("body").strip()
            action_id = str(uuid4())
            pending_action = PendingAction(
                action_id=action_id,
                action_type="send_email",
                arguments={"recipient": recipient, "subject": subject, "body": body},
                preview_message=f"Send email to {recipient} with subject '{subject}'",
            )
            return ConfirmationResult(
                requires_confirmation=True,
                response_message=(
                    f"I prepared that email. Reply `confirm {action_id}` to send it or `cancel {action_id}` to discard it. "
                    f"Planned action: {pending_action.preview_message}."
                ),
                pending_action=pending_action,
            )

        transfer_match = self.CRYPTO_TRANSFER_PATTERN.search(text)
        if transfer_match:
            amount = transfer_match.group("amount").strip()
            address = transfer_match.group("address").strip()
            action_id = str(uuid4())
            pending_action = PendingAction(
                action_id=action_id,
                action_type="prepare_crypto_transfer",
                arguments={"to_address": address, "amount_eth": amount},
                preview_message=f"Transfer {amount} ETH to {address}",
            )
            return ConfirmationResult(
                requires_confirmation=True,
                response_message=(
                    f"Crypto transfer detected. Reply `confirm {action_id}` to proceed or `cancel {action_id}` to stop. "
                    f"Planned action: {pending_action.preview_message}."
                ),
                pending_action=pending_action,
            )

        return ConfirmationResult(requires_confirmation=False, response_message="")

    def execute(self, pending_action: PendingAction) -> str:
        """Execute a previously approved action."""
        if pending_action.action_type == "control_lights":
            return control_lights.invoke(pending_action.arguments)

        if pending_action.action_type == "send_email":
            return send_email.invoke(pending_action.arguments)

        if pending_action.action_type == "prepare_crypto_transfer":
            return prepare_crypto_transfer.invoke(pending_action.arguments)

        raise ValueError(f"Unsupported action type: {pending_action.action_type}")


action_guard = ActionGuard()
