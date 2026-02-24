import asyncio
import json
from dataclasses import dataclass

from app.api.chat_handler import handle_chat_message


@dataclass
class _FakeConfirmationResult:
    handled: bool
    response_message: str


@dataclass
class _FakePendingAction:
    action_id: str


@dataclass
class _FakePolicyResult:
    requires_confirmation: bool
    response_message: str
    pending_action: _FakePendingAction | None = None


class _FakeStore:
    def __init__(self) -> None:
        self.turns: list[tuple[str, str, str]] = []
        self.pending = None

    def append_turn(self, session_id: str, user_text: str, assistant_text: str) -> None:
        self.turns.append((session_id, user_text, assistant_text))

    def get_history(self, session_id: str):
        return []

    def set_pending_action(self, session_id: str, pending_action) -> None:
        self.pending = (session_id, pending_action)


class _FakeOrchestrator:
    async def astream_responses(self, text: str, history):
        for part in ["hello", " world"]:
            yield part


class _FakeGuard:
    def __init__(self, result: _FakePolicyResult) -> None:
        self._result = result

    def evaluate(self, text: str) -> _FakePolicyResult:
        return self._result


def test_chat_handler_returns_error_on_invalid_payload() -> None:
    store = _FakeStore()

    result = asyncio.run(
        handle_chat_message(
            raw_data="not-json",
            session_id="session-1",
            session_store=store,
            action_guard=_FakeGuard(_FakePolicyResult(False, "")),
            confirmation_handler=lambda *args, **kwargs: _FakeConfirmationResult(False, ""),
            orchestrator=_FakeOrchestrator(),
        )
    )

    payload = json.loads(result.outbound_messages[0])
    assert payload["type"] == "error"


def test_chat_handler_returns_confirmation_payload() -> None:
    store = _FakeStore()

    result = asyncio.run(
        handle_chat_message(
            raw_data=json.dumps({"text": "send email"}),
            session_id="session-2",
            session_store=store,
            action_guard=_FakeGuard(_FakePolicyResult(False, "")),
            confirmation_handler=lambda *args, **kwargs: _FakeConfirmationResult(True, "confirmed"),
            orchestrator=_FakeOrchestrator(),
        )
    )

    chunk_payload = json.loads(result.outbound_messages[0])
    end_payload = json.loads(result.outbound_messages[1])
    assert chunk_payload["type"] == "chunk"
    assert end_payload["type"] == "end"


def test_chat_handler_streams_model_chunks() -> None:
    store = _FakeStore()

    result = asyncio.run(
        handle_chat_message(
            raw_data=json.dumps({"text": "hi"}),
            session_id="session-3",
            session_store=store,
            action_guard=_FakeGuard(_FakePolicyResult(False, "")),
            confirmation_handler=lambda *args, **kwargs: _FakeConfirmationResult(False, ""),
            orchestrator=_FakeOrchestrator(),
        )
    )

    first = json.loads(result.outbound_messages[0])
    second = json.loads(result.outbound_messages[1])
    end_payload = json.loads(result.outbound_messages[2])
    assert first["type"] == "chunk"
    assert second["type"] == "chunk"
    assert end_payload["type"] == "end"
