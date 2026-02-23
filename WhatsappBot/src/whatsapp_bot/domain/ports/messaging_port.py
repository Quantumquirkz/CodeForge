"""Port definition for messaging providers."""

from __future__ import annotations

from typing import Protocol


class MessagingPort(Protocol):
    """Contract for a messaging transport adapter."""

    def normalize_incoming_payload(self, payload: dict, form_data: dict) -> tuple[str, str]:
        """Extract `(sender, message)` from provider payload."""
