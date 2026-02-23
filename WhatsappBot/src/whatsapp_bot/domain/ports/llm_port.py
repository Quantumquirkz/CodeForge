"""Port definition for LLM providers."""

from __future__ import annotations

from typing import Protocol


class LLMPort(Protocol):
    """Protocol for language model implementations."""

    def generate_response(
        self,
        user_message: str,
        system_prompt: str | None = None,
        conversation_history: list[dict[str, str]] | None = None,
    ) -> str:
        """Generate a text response for the given user message."""
