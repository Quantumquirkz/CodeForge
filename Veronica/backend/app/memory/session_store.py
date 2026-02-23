"""In-memory conversation session store.

This module provides a lightweight, process-local session history manager to
stabilize chat context handling while the project evolves toward persistent
session infrastructure.
"""

from __future__ import annotations

from collections import defaultdict
from threading import Lock
from typing import Any, DefaultDict

from langchain_core.messages import AIMessage, BaseMessage, HumanMessage


class SessionStore:
    """Thread-safe in-memory store for websocket conversation history."""

    def __init__(self, max_messages: int = 20) -> None:
        self._max_messages = max_messages
        self._store: DefaultDict[str, list[BaseMessage]] = defaultdict(list)
        self._pending_actions: dict[str, Any] = {}
        self._lock = Lock()

    def get_history(self, session_id: str) -> list[BaseMessage]:
        """Return a copy of current conversation history for a session."""
        with self._lock:
            return list(self._store[session_id])

    def append_turn(self, session_id: str, user_text: str, assistant_text: str) -> None:
        """Append one user/assistant turn and enforce configured message cap."""
        with self._lock:
            self._store[session_id].extend(
                [
                    HumanMessage(content=user_text),
                    AIMessage(content=assistant_text),
                ]
            )
            if len(self._store[session_id]) > self._max_messages:
                self._store[session_id] = self._store[session_id][-self._max_messages :]

    def set_pending_action(self, session_id: str, pending_action: Any) -> None:
        """Store one pending action for a session."""
        with self._lock:
            self._pending_actions[session_id] = pending_action

    def get_pending_action(self, session_id: str) -> Any | None:
        """Fetch a pending action for a session if available."""
        with self._lock:
            return self._pending_actions.get(session_id)

    def clear_pending_action(self, session_id: str) -> None:
        """Remove pending action for a session."""
        with self._lock:
            self._pending_actions.pop(session_id, None)

    def clear(self, session_id: str) -> None:
        """Remove one session from memory."""
        with self._lock:
            self._store.pop(session_id, None)
            self._pending_actions.pop(session_id, None)


session_store = SessionStore()
