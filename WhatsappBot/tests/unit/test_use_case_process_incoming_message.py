"""Unit tests for ProcessIncomingMessage use case."""

from __future__ import annotations

import sys
from pathlib import Path

SRC_PATH = Path(__file__).resolve().parents[2] / "src"
if str(SRC_PATH) not in sys.path:
    sys.path.insert(0, str(SRC_PATH))

import unittest

from whatsapp_bot.use_cases.process_incoming_message import ProcessIncomingMessage


class FakeLLMClient:
    """Simple in-memory fake to inspect use-case interactions."""

    def __init__(self) -> None:
        self.calls: list[dict] = []

    def generate_response(
        self,
        user_message: str,
        system_prompt: str | None = None,
        conversation_history: list[dict[str, str]] | None = None,
    ) -> str:
        self.calls.append(
            {
                "user_message": user_message,
                "system_prompt": system_prompt,
                "conversation_history": conversation_history,
            }
        )
        return "fake-response"


class TestProcessIncomingMessage(unittest.TestCase):
    def test_execute_builds_prompt_and_calls_llm(self) -> None:
        llm = FakeLLMClient()
        use_case = ProcessIncomingMessage(llm_client=llm)

        response = use_case.execute(user_id="user-1", message="Hola")

        self.assertEqual(response, "fake-response")
        self.assertEqual(len(llm.calls), 1)
        self.assertIn("IMPORTANTE: Responde en es", llm.calls[0]["system_prompt"])

    def test_execute_stores_context(self) -> None:
        llm = FakeLLMClient()
        use_case = ProcessIncomingMessage(llm_client=llm)

        _ = use_case.execute(user_id="u-2", message="hola")
        history = use_case.context_store.get_history("u-2")

        self.assertEqual(len(history), 2)
        self.assertEqual(history[0]["role"], "user")
        self.assertEqual(history[1]["role"], "assistant")


if __name__ == "__main__":
    unittest.main()
