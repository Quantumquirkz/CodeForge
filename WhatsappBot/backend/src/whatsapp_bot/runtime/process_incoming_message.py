from __future__ import annotations

import time

from whatsapp_bot.core.settings import settings
from whatsapp_bot.persona_engine import PromptBuilder
from whatsapp_bot.persistence.repositories import BotRepository


class ProcessIncomingMessage:
    def __init__(self, repository: BotRepository, llm_client, style_ttl_seconds: int = 20) -> None:
        self.repository = repository
        self.llm_client = llm_client
        self.style_ttl_seconds = style_ttl_seconds
        self._style_cache: dict = {"guide": "", "expires": 0}
        self._conversation_store: dict[str, list[dict[str, str]]] = {}

    def _resolve_style(self) -> str:
        now = time.time()
        if now < self._style_cache["expires"] and self._style_cache["guide"]:
            return self._style_cache["guide"]
        snapshot = self.repository.get_style_guide()
        self._style_cache = {
            "guide": snapshot.guide_text,
            "expires": now + self.style_ttl_seconds,
        }
        return snapshot.guide_text

    def execute(self, user_id: str, message: str) -> str:
        config = self.repository.get_config()
        style_guide = self._resolve_style()

        system_base = (
            f"Eres {config.bot_name}, un asistente de WhatsApp. "
            f"Prioriza respuestas {config.response_length_policy}. "
            f"Politica de emojis: {config.emoji_policy}."
        )
        system_prompt = PromptBuilder.build(
            system_base=system_base,
            persona_style_guide=style_guide,
            message_context=f"Usuario:{user_id}",
        )

        history = self._conversation_store.get(user_id, []) if config.context_enabled else None
        response = self.llm_client.generate_response(
            user_message=message,
            system_prompt=system_prompt,
            conversation_history=history,
            temperature=config.temperature,
            max_tokens=config.max_tokens,
        )

        if config.context_enabled:
            history = self._conversation_store.get(user_id, [])
            history.append({"role": "user", "content": message})
            history.append({"role": "assistant", "content": response})
            self._conversation_store[user_id] = history[-(config.context_memory_size * 2):]

        return response
