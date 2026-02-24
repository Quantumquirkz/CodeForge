from __future__ import annotations

import logging

from groq import Groq
from groq._exceptions import APIError

from whatsapp_bot.core.settings import settings

logger = logging.getLogger(__name__)


class GroqClient:
    def __init__(self) -> None:
        if not settings.groq_api_key:
            raise ValueError("GROQ_API_KEY is missing")
        self.client = Groq(api_key=settings.groq_api_key)

    def generate_response(
        self,
        user_message: str,
        system_prompt: str,
        conversation_history: list[dict] | None,
        temperature: float,
        max_tokens: int,
    ) -> str:
        messages = [{"role": "system", "content": system_prompt}]
        if conversation_history:
            messages.extend(conversation_history[-10:])
        messages.append({"role": "user", "content": user_message})

        response = self.client.chat.completions.create(
            model=settings.groq_model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
            stream=False,
        )
        return response.choices[0].message.content.strip()


class NullGroqClient:
    def generate_response(
        self,
        user_message: str,
        system_prompt: str,
        conversation_history: list[dict] | None,
        temperature: float,
        max_tokens: int,
    ) -> str:
        _ = (system_prompt, conversation_history, temperature, max_tokens)
        return f"[Modo fallback sin Groq] Recibi: {user_message}"
