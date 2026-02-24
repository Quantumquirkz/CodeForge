"""WebSocket chat protocol handler.

This module isolates message-level protocol logic from transport wiring so tests
can validate behavior without spinning network infrastructure.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Protocol

from pydantic import ValidationError

from app.models.chat import (
    ChatInboundMessage,
    ChatOutboundChunk,
    ChatOutboundEnd,
    ChatOutboundError,
    ChatOutboundRequiresConfirmation,
)


class SessionStoreProtocol(Protocol):
    def append_turn(self, session_id: str, user_text: str, assistant_text: str) -> None: ...
    def get_history(self, session_id: str): ...
    def set_pending_action(self, session_id: str, pending_action) -> None: ...


@dataclass(slots=True)
class HandleMessageResult:
    """Result of processing one inbound websocket frame."""

    outbound_messages: list[str]


async def handle_chat_message(
    *,
    raw_data: str,
    session_id: str,
    session_store: SessionStoreProtocol,
    action_guard,
    confirmation_handler,
    orchestrator,
) -> HandleMessageResult:
    """Validate and process one inbound websocket payload.

    Returns serialized outbound payloads ready for transport.
    """
    try:
        payload = ChatInboundMessage.model_validate(json.loads(raw_data))
    except (json.JSONDecodeError, ValidationError) as exc:
        return HandleMessageResult(
            outbound_messages=[ChatOutboundError(message=f"Invalid payload: {exc}").model_dump_json()]
        )

    confirmation_result = confirmation_handler(
        session_id,
        payload.text,
        session_store=session_store,
        action_guard=action_guard,
    )
    if confirmation_result.handled:
        session_store.append_turn(session_id, payload.text, confirmation_result.response_message)
        return HandleMessageResult(
            outbound_messages=[
                ChatOutboundChunk(text=confirmation_result.response_message).model_dump_json(),
                ChatOutboundEnd().model_dump_json(),
            ]
        )

    policy_result = action_guard.evaluate(payload.text)
    if policy_result.requires_confirmation and policy_result.pending_action:
        session_store.set_pending_action(session_id, policy_result.pending_action)
        session_store.append_turn(session_id, payload.text, policy_result.response_message)
        return HandleMessageResult(
            outbound_messages=[
                ChatOutboundRequiresConfirmation(
                    action_id=policy_result.pending_action.action_id,
                    message=policy_result.response_message,
                ).model_dump_json(),
                ChatOutboundEnd().model_dump_json(),
            ]
        )

    history = session_store.get_history(session_id)
    full_response = ""
    chunks: list[str] = []
    async for chunk in orchestrator.astream_responses(payload.text, history):
        full_response += chunk
        chunks.append(ChatOutboundChunk(text=chunk).model_dump_json())

    session_store.append_turn(session_id, payload.text, full_response)
    chunks.append(ChatOutboundEnd().model_dump_json())
    return HandleMessageResult(outbound_messages=chunks)
