"""Request/response schema helpers for API routes."""

from __future__ import annotations

from dataclasses import dataclass

from whatsapp_bot.shared.exceptions import ValidationError


@dataclass(frozen=True)
class IncomingMessageDTO:
    """Normalized incoming message payload."""

    sender: str
    message: str

    def __post_init__(self) -> None:
        if not self.message.strip():
            raise ValidationError("message must not be empty")


def build_incoming_dto(sender: str, message: str) -> IncomingMessageDTO:
    """Build and validate incoming message DTO."""
    normalized_sender = sender.strip() or "unknown"
    normalized_message = message.strip()
    return IncomingMessageDTO(sender=normalized_sender, message=normalized_message)
