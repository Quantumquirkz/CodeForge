"""Unit tests for domain services."""

from __future__ import annotations

import sys
from pathlib import Path

SRC_PATH = Path(__file__).resolve().parents[2] / "src"
if str(SRC_PATH) not in sys.path:
    sys.path.insert(0, str(SRC_PATH))

import unittest

from whatsapp_bot.domain.services.language_detector import LanguageDetector
from whatsapp_bot.domain.services.message_classifier import MessageClassifier


class TestLanguageDetector(unittest.TestCase):
    def setUp(self) -> None:
        self.detector = LanguageDetector()

    def test_detect_spanish(self) -> None:
        self.assertEqual(self.detector.detect("hola, cómo estás"), "es")

    def test_detect_english(self) -> None:
        self.assertEqual(self.detector.detect("hello, where is support"), "en")

    def test_detect_portuguese(self) -> None:
        self.assertEqual(self.detector.detect("olá, onde posso pagar?"), "pt")


class TestMessageClassifier(unittest.TestCase):
    def setUp(self) -> None:
        self.classifier = MessageClassifier()

    def test_classifies_greeting(self) -> None:
        self.assertEqual(self.classifier.classify("Hola equipo"), "greeting")

    def test_classifies_technical(self) -> None:
        self.assertEqual(self.classifier.classify("cómo usar esta función?"), "technical")

    def test_classifies_complaint(self) -> None:
        self.assertEqual(self.classifier.classify("tengo un problema, no funciona"), "complaint")


if __name__ == "__main__":
    unittest.main()
