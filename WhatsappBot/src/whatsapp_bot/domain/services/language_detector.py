"""Language detection service."""

from __future__ import annotations


class LanguageDetector:
    """Detects user language using lightweight keyword heuristics."""

    def detect(self, text: str) -> str:
        text_lower = text.lower()

        spanish_words = ["hola", "gracias", "por favor", "adiós", "cómo", "qué", "dónde"]
        english_words = ["hello", "thanks", "please", "goodbye", "how", "what", "where"]
        portuguese_words = ["olá", "obrigado", "por favor", "tchau", "como", "o que", "onde"]

        spanish_count = sum(1 for word in spanish_words if word in text_lower)
        english_count = sum(1 for word in english_words if word in text_lower)
        portuguese_count = sum(1 for word in portuguese_words if word in text_lower)

        if spanish_count > english_count and spanish_count > portuguese_count:
            return "es"
        if english_count > portuguese_count:
            return "en"
        if portuguese_count > 0:
            return "pt"
        return "es"
