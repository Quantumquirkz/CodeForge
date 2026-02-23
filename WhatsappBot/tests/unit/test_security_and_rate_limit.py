"""Unit tests for security and rate limiting infrastructure."""

from __future__ import annotations

import sys
from pathlib import Path

SRC_PATH = Path(__file__).resolve().parents[2] / "src"
if str(SRC_PATH) not in sys.path:
    sys.path.insert(0, str(SRC_PATH))

import unittest

from whatsapp_bot.infrastructure.security.request_verifier import TwilioRequestVerifier
from whatsapp_bot.infrastructure.storage.in_memory_rate_limiter import InMemoryRateLimiter


class TestInMemoryRateLimiter(unittest.TestCase):
    def test_allows_until_limit_then_denies(self) -> None:
        limiter = InMemoryRateLimiter(max_requests=2, window_seconds=60)
        self.assertTrue(limiter.allow("u1"))
        self.assertTrue(limiter.allow("u1"))
        self.assertFalse(limiter.allow("u1"))


class TestTwilioRequestVerifier(unittest.TestCase):
    def test_missing_signature_is_invalid(self) -> None:
        verifier = TwilioRequestVerifier(auth_token="dummy")
        self.assertFalse(verifier.is_valid("https://example.com/webhook", {"Body": "Hi"}, None))


if __name__ == "__main__":
    unittest.main()
