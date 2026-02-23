"""Domain entity representing a chat message."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class Message:
    """Represents a user/assistant message in the conversation flow."""

    user_id: str
    content: str
    channel: str = "whatsapp"

    def __post_init__(self) -> None:
        if not self.user_id.strip():
            raise ValueError("user_id must not be empty")
        if not self.content.strip():
            raise ValueError("content must not be empty")
