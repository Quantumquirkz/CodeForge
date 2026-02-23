"""Twilio messaging adapter."""

from __future__ import annotations


class TwilioAdapter:
    """Adapter utilities to parse Twilio webhook payloads."""

    @staticmethod
    def normalize_incoming_payload(payload: dict, form_data: dict) -> tuple[str, str]:
        """Extract sender and incoming message from Twilio/form payload."""
        sender = form_data.get("From", "") or payload.get("from", "")
        message = form_data.get("Body", "") or payload.get("message", "")
        return sender, message
