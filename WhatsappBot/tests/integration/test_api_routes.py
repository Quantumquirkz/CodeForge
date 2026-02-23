"""Integration-style tests for API routes."""

from __future__ import annotations

import sys
from pathlib import Path

SRC_PATH = Path(__file__).resolve().parents[2] / "src"
if str(SRC_PATH) not in sys.path:
    sys.path.insert(0, str(SRC_PATH))

import unittest

from flask import Flask

from whatsapp_bot.app.api.routes import build_api_blueprint


class FakeUseCase:
    def execute(self, user_id: str, message: str) -> str:
        return f"echo:{user_id}:{message}"


class AlwaysDenyLimiter:
    def allow(self, key: str) -> bool:
        _ = key
        return False


class AlwaysInvalidVerifier:
    def is_valid(self, url: str, form_data: dict[str, str], signature: str | None) -> bool:
        _ = (url, form_data, signature)
        return False


class TestApiRoutes(unittest.TestCase):
    def setUp(self) -> None:
        self.app = Flask(__name__)
        self.app.register_blueprint(build_api_blueprint(FakeUseCase()))
        self.client = self.app.test_client()

    def test_health_endpoint(self) -> None:
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json["status"], "healthy")

    def test_webhook_json_payload(self) -> None:
        response = self.client.post("/webhook", json={"from": "user1", "message": "Hola"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json["status"], "success")
        self.assertEqual(response.json["response"], "echo:user1:Hola")

    def test_webhook_twilio_form_payload(self) -> None:
        response = self.client.post("/webhook", data={"From": "whatsapp:+555", "Body": "Hi"})
        self.assertEqual(response.status_code, 200)
        self.assertIn("echo:whatsapp:+555:Hi", response.get_data(as_text=True))

    def test_webhook_empty_payload(self) -> None:
        response = self.client.post("/webhook", json={})
        self.assertEqual(response.status_code, 400)

    def test_webhook_rate_limit_exceeded(self) -> None:
        app = Flask("rate-limit")
        app.register_blueprint(build_api_blueprint(FakeUseCase(), rate_limiter=AlwaysDenyLimiter()))
        client = app.test_client()

        response = client.post("/webhook", json={"from": "user1", "message": "Hola"})
        self.assertEqual(response.status_code, 429)

    def test_webhook_invalid_twilio_signature(self) -> None:
        app = Flask("twilio-signature")
        app.register_blueprint(
            build_api_blueprint(FakeUseCase(), twilio_verifier=AlwaysInvalidVerifier())
        )
        client = app.test_client()

        response = client.post(
            "/webhook",
            data={"From": "whatsapp:+555", "Body": "Hi"},
            headers={"X-Twilio-Signature": "bad-signature"},
        )
        self.assertEqual(response.status_code, 403)


if __name__ == "__main__":
    unittest.main()
