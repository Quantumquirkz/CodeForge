"""Domain entity for conversation metadata."""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class Conversation:
    """Tracks an in-memory conversation timeline for a user."""

    user_id: str
    messages: list[dict[str, str]] = field(default_factory=list)

    def add_message(self, role: str, content: str) -> None:
        """Append a validated message to this conversation."""
        if role not in {"user", "assistant", "system"}:
            raise ValueError("role must be one of: user, assistant, system")
        if not content.strip():
            raise ValueError("content must not be empty")
        self.messages.append({"role": role, "content": content})
