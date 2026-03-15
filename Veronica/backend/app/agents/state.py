"""Shared state for the Veronica orchestrator graph."""

from typing import Any, TypedDict

from langchain_core.messages import BaseMessage


class VeronicaState(TypedDict, total=False):
    """State shared across the main orchestrator graph."""

    messages: list[BaseMessage]
    session_id: str
    pending_action: dict[str, Any] | None
    retrieved_context: list[str]
    tool_results: list[dict[str, Any]]
    current_route: str
    final_response: str
