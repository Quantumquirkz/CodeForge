"""Meta WhatsApp Cloud API adapter."""

from __future__ import annotations


class MetaAdapter:
    """Adapter utilities to parse a simplified Meta-style JSON payload."""

    @staticmethod
    def normalize_incoming_payload(payload: dict, form_data: dict) -> tuple[str, str]:
        """Extract sender and incoming message from JSON payload.

        Notes:
            This currently supports a simplified structure:
            {"from": "...", "message": "..."}
        """
        _ = form_data
        sender = payload.get("from", "")
        message = payload.get("message", "")
        return sender, message
