"""Backward-compatible MessageHandler facade."""

from __future__ import annotations

import sys
from pathlib import Path

SRC_PATH = Path(__file__).resolve().parent / "src"
if str(SRC_PATH) not in sys.path:
    sys.path.insert(0, str(SRC_PATH))

from whatsapp_bot.domain.services.language_detector import LanguageDetector
from whatsapp_bot.domain.services.message_classifier import MessageClassifier
from whatsapp_bot.integrations.ai.fallback_client import FallbackLLMClient
from whatsapp_bot.integrations.ai.groq_client import GroqClient
from whatsapp_bot.use_cases.process_incoming_message import ProcessIncomingMessage


class MessageHandler:
    """Compatibility facade exposing previous public methods."""

    def __init__(self) -> None:
        self.language_detector = LanguageDetector()
        self.message_classifier = MessageClassifier()
        try:
            llm_client = GroqClient()
        except ValueError as exc:
            llm_client = FallbackLLMClient(reason=str(exc))

        self._use_case = ProcessIncomingMessage(llm_client=llm_client)

    def detect_language(self, text: str) -> str:
        return self.language_detector.detect(text)

    def classify_message(self, message: str) -> str:
        return self.message_classifier.classify(message)

    def process_message(self, user_id: str, message: str) -> str:
        return self._use_case.execute(user_id=user_id, message=message)

    def get_greeting(self, language: str = "es") -> str:
        return self._use_case.get_greeting(language)

    def get_farewell(self, language: str = "es") -> str:
        return self._use_case.get_farewell(language)
