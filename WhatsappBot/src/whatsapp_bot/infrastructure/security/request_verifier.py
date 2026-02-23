"""Request verification helpers for messaging providers."""

from __future__ import annotations

from dataclasses import dataclass

from twilio.request_validator import RequestValidator


@dataclass(frozen=True)
class TwilioRequestVerifier:
    """Verifies Twilio webhook signatures using the auth token."""

    auth_token: str

    def is_valid(self, url: str, form_data: dict[str, str], signature: str | None) -> bool:
        """Validate Twilio request signature."""
        if not signature:
            return False
        validator = RequestValidator(self.auth_token)
        return validator.validate(url, form_data, signature)
