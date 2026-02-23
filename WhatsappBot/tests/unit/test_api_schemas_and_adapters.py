"""Unit tests for API schema validation and messaging adapters."""

from __future__ import annotations

import sys
from pathlib import Path

SRC_PATH = Path(__file__).resolve().parents[2] / "src"
if str(SRC_PATH) not in sys.path:
    sys.path.insert(0, str(SRC_PATH))

import unittest

from whatsapp_bot.app.api.schemas import build_incoming_dto
from whatsapp_bot.integrations.messaging.meta_adapter import MetaAdapter
from whatsapp_bot.integrations.messaging.twilio_adapter import TwilioAdapter
from whatsapp_bot.shared.exceptions import ValidationError


class TestApiSchemasAndAdapters(unittest.TestCase):
    def test_build_incoming_dto_defaults_sender(self) -> None:
        dto = build_incoming_dto(sender="", message=" hola ")
        self.assertEqual(dto.sender, "unknown")
        self.assertEqual(dto.message, "hola")

    def test_build_incoming_dto_rejects_empty_message(self) -> None:
        with self.assertRaises(ValidationError):
            build_incoming_dto(sender="abc", message="   ")

    def test_twilio_adapter_normalizes_form_payload(self) -> None:
        sender, message = TwilioAdapter.normalize_incoming_payload(
            payload={},
            form_data={"From": "whatsapp:+123", "Body": "Hello"},
        )
        self.assertEqual(sender, "whatsapp:+123")
        self.assertEqual(message, "Hello")

    def test_meta_adapter_normalizes_json_payload(self) -> None:
        sender, message = MetaAdapter.normalize_incoming_payload(
            payload={"from": "u1", "message": "Hola"},
            form_data={},
        )
        self.assertEqual(sender, "u1")
        self.assertEqual(message, "Hola")


if __name__ == "__main__":
    unittest.main()
