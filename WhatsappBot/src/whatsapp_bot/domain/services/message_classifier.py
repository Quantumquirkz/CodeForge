"""Message classification service."""

from __future__ import annotations

import re


class MessageClassifier:
    """Classifies incoming messages into intent-like categories."""

    def classify(self, message: str) -> str:
        message_lower = message.lower()

        greeting_patterns = [
            r"\b(hola|hi|hello|hey|buenos días|buenas tardes|buenas noches|olá)\b",
            r"\b(saludos|greetings)\b",
        ]
        if self._matches_any(message_lower, greeting_patterns):
            return "greeting"

        farewell_patterns = [
            r"\b(adiós|bye|goodbye|hasta luego|nos vemos|tchau|até logo)\b",
            r"\b(gracias|thanks|thank you|obrigado)\b.*\b(adiós|bye|goodbye)\b",
        ]
        if self._matches_any(message_lower, farewell_patterns):
            return "farewell"

        complaint_patterns = [
            r"\b(problema|problem|error|no funciona|doesn't work|não funciona)\b",
            r"\b(mal|bad|terrible|horrible|pésimo)\b",
            r"\b(queja|complaint|reclamo)\b",
        ]
        if self._matches_any(message_lower, complaint_patterns):
            return "complaint"

        technical_patterns = [
            r"\b(cómo|how|como)\b.*\b(hacer|do|fazer|usar|use)\b",
            r"\b(ayuda|help|ajuda|soporte|support)\b",
            r"\b(tutorial|guía|guide|instrucciones|instructions)\b",
        ]
        if self._matches_any(message_lower, technical_patterns):
            return "technical"

        question_patterns = [r"\?", r"\b(qué|what|o que|cual|which|cuándo|when|dónde|where|por qué|why)\b"]
        if self._matches_any(message_lower, question_patterns):
            return "question"

        return "general"

    @staticmethod
    def _matches_any(text: str, patterns: list[str]) -> bool:
        return any(re.search(pattern, text, re.IGNORECASE) for pattern in patterns)
