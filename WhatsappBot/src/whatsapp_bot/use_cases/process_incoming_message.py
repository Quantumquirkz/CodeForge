"""Use case for processing incoming user messages."""

from __future__ import annotations

import logging
from random import choice

from whatsapp_bot.domain.ports.llm_port import LLMPort
from whatsapp_bot.domain.services.language_detector import LanguageDetector
from whatsapp_bot.domain.services.message_classifier import MessageClassifier
from whatsapp_bot.infrastructure.config.settings import settings
from whatsapp_bot.infrastructure.storage.in_memory_context_store import InMemoryContextStore
from whatsapp_bot.prompts.templates import (
    COMPLAINT_PROMPT,
    FAREWELL_PROMPT,
    FAREWELLS_BY_LANGUAGE,
    GREETING_PROMPT,
    GREETINGS_BY_LANGUAGE,
    QUESTION_PROMPT,
    SYSTEM_PROMPT,
    TECHNICAL_SUPPORT_PROMPT,
)

logger = logging.getLogger(__name__)


class ProcessIncomingMessage:
    """Orchestrates language detection, classification and response generation."""

    def __init__(self, llm_client: LLMPort) -> None:
        self.llm_client = llm_client
        self.language_detector = LanguageDetector()
        self.classifier = MessageClassifier()
        self.context_store = InMemoryContextStore(memory_size=settings.context_memory_size)

    def execute(self, user_id: str, message: str) -> str:
        language = self.language_detector.detect(message)
        message_type = self.classifier.classify(message)

        prompt_map = {
            "greeting": GREETING_PROMPT,
            "question": QUESTION_PROMPT,
            "technical": TECHNICAL_SUPPORT_PROMPT,
            "complaint": COMPLAINT_PROMPT,
            "farewell": FAREWELL_PROMPT,
            "general": SYSTEM_PROMPT,
        }
        contextual_prompt = prompt_map.get(message_type, SYSTEM_PROMPT)
        enhanced_prompt = f"{SYSTEM_PROMPT}\n\n{contextual_prompt}\n\nIMPORTANTE: Responde en {language}."

        history = self.context_store.get_history(user_id) if settings.enable_context else None
        response = self.llm_client.generate_response(
            user_message=message,
            system_prompt=enhanced_prompt,
            conversation_history=history,
        )

        if settings.enable_context:
            self.context_store.append(user_id, "user", message)
            self.context_store.append(user_id, "assistant", response)

        logger.info("Message classified as %s (%s)", message_type, language)
        return response

    def get_greeting(self, language: str = "es") -> str:
        return choice(GREETINGS_BY_LANGUAGE.get(language, GREETINGS_BY_LANGUAGE["es"]))

    def get_farewell(self, language: str = "es") -> str:
        return choice(FAREWELLS_BY_LANGUAGE.get(language, FAREWELLS_BY_LANGUAGE["es"]))
