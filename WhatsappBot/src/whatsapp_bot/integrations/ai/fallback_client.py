"""Fallback LLM client for non-configured environments."""

from __future__ import annotations


class FallbackLLMClient:
    """Returns a deterministic message when no LLM provider is configured."""

    def __init__(self, reason: str) -> None:
        self.reason = reason

    def generate_response(
        self,
        user_message: str,
        system_prompt: str | None = None,
        conversation_history: list[dict[str, str]] | None = None,
    ) -> str:
        return (
            "El bot está en modo limitado: configura GROQ_API_KEY para generar "
            f"respuestas con IA. Detalle: {self.reason}"
        )
