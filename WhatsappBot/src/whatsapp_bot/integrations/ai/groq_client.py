"""Groq adapter implementing the LLM port."""

from __future__ import annotations

import logging

from groq import Groq

from whatsapp_bot.infrastructure.config.settings import settings

logger = logging.getLogger(__name__)


class GroqClient:
    """Client wrapper for Groq chat completions API."""

    def __init__(self) -> None:
        if not settings.groq_api_key:
            raise ValueError("GROQ_API_KEY not found in environment variables")

        self.client = Groq(api_key=settings.groq_api_key)
        self.model = settings.groq_model
        self.max_tokens = settings.groq_max_tokens
        self.temperature = settings.groq_temperature

    def generate_response(
        self,
        user_message: str,
        system_prompt: str | None = None,
        conversation_history: list[dict[str, str]] | None = None,
    ) -> str:
        try:
            resolved_prompt = (
                system_prompt
                or "Eres un asistente virtual amigable y profesional para WhatsApp."
            )
            messages: list[dict[str, str]] = [{"role": "system", "content": resolved_prompt}]
            if conversation_history:
                messages.extend(conversation_history[-10:])
            messages.append({"role": "user", "content": user_message})

            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                max_tokens=self.max_tokens,
                temperature=self.temperature,
                stream=False,
            )
            return response.choices[0].message.content.strip()
        except Exception as exc:  # noqa: BLE001
            logger.exception("Error generating response with Groq: %s", exc)
            return "Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo."
