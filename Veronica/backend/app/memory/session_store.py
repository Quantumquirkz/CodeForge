<<<<<<< HEAD
"""In-memory conversation session store.

This module provides a lightweight, process-local session history manager to
stabilize chat context handling while the project evolves toward persistent
session infrastructure.
=======
"""
In-memory conversation session store.

This module provides a thread-safe, process-local session history manager for
storing conversation history and pending actions. It is designed to stabilize
chat context handling while the project evolves toward persistent session infrastructure.
>>>>>>> main
"""

from __future__ import annotations

from collections import defaultdict
from threading import Lock
<<<<<<< HEAD
from typing import TYPE_CHECKING, Any, DefaultDict

from langchain_core.messages import AIMessage, BaseMessage, HumanMessage

if TYPE_CHECKING:
    from app.policy.action_guard import PendingAction
else:
    PendingAction = Any


class SessionStore:
    """Thread-safe in-memory store for websocket conversation history."""

    def __init__(self, max_messages: int = 20) -> None:
        self._max_messages = max_messages
        self._store: DefaultDict[str, list[BaseMessage]] = defaultdict(list)
        self._pending_actions: dict[str, PendingAction] = {}
        self._lock = Lock()

    def get_history(self, session_id: str) -> list[BaseMessage]:
        """Return a copy of current conversation history for a session."""
        with self._lock:
            return list(self._store[session_id])

    def append_turn(self, session_id: str, user_text: str, assistant_text: str) -> None:
        """Append one user/assistant turn and enforce configured message cap."""
=======
from typing import Any, DefaultDict, Optional

from langchain_core.messages import AIMessage, BaseMessage, HumanMessage

class SessionStore:
    """
    Thread-safe in-memory store for WebSocket conversation history and pending actions.

    Attributes:
        _max_messages (int): Maximum number of messages to retain per session.
        _store (DefaultDict[str, list[BaseMessage]]): Stores conversation history per session.
        _pending_actions (dict[str, Any]): Stores pending actions per session.
        _lock (Lock): Thread lock for thread-safe operations.
    """

    def __init__(self, max_messages: int = 20) -> None:
        """
        Initialize the session store.

        Args:
            max_messages (int): Maximum number of messages to retain per session.
        """
        self._max_messages = max_messages
        self._store: DefaultDict[str, list[BaseMessage]] = defaultdict(list)
        self._pending_actions: dict[str, Any] = {}
        self._lock = Lock()

    def get_history(self, session_id: str) -> list[BaseMessage]:
        """
        Return a copy of the current conversation history for a session.

        Args:
            session_id (str): The session ID.

        Returns:
            list[BaseMessage]: A copy of the conversation history.
        """
        with self._lock:
            return list(self._store[session_id])

    def append_turn(
        self, session_id: str, user_text: str, assistant_text: str
    ) -> None:
        """
        Append one user/assistant turn to the session history and enforce the message cap.

        Args:
            session_id (str): The session ID.
            user_text (str): The user's message.
            assistant_text (str): The assistant's response.
        """
>>>>>>> main
        with self._lock:
            self._store[session_id].extend(
                [
                    HumanMessage(content=user_text),
                    AIMessage(content=assistant_text),
                ]
            )
            if len(self._store[session_id]) > self._max_messages:
<<<<<<< HEAD
                self._store[session_id] = self._store[session_id][-self._max_messages :]

    def set_pending_action(self, session_id: str, pending_action: PendingAction) -> None:
        """Store one pending action for a session."""
        with self._lock:
            self._pending_actions[session_id] = pending_action

    def get_pending_action(self, session_id: str) -> PendingAction | None:
        """Fetch a pending action for a session if available."""
=======
                self._store[session_id] = self._store[session_id][
                    -self._max_messages :
                ]

    def set_pending_action(self, session_id: str, pending_action: Any) -> None:
        """
        Store a pending action for a session.

        Args:
            session_id (str): The session ID.
            pending_action (Any): The pending action to store.
        """
        with self._lock:
            self._pending_actions[session_id] = pending_action

    def get_pending_action(self, session_id: str) -> Optional[Any]:
        """
        Fetch the pending action for a session if available.

        Args:
            session_id (str): The session ID.

        Returns:
            Optional[Any]: The pending action, or None if not found.
        """
>>>>>>> main
        with self._lock:
            return self._pending_actions.get(session_id)

    def clear_pending_action(self, session_id: str) -> None:
<<<<<<< HEAD
        """Remove pending action for a session."""
=======
        """
        Remove the pending action for a session.

        Args:
            session_id (str): The session ID.
        """
>>>>>>> main
        with self._lock:
            self._pending_actions.pop(session_id, None)

    def clear(self, session_id: str) -> None:
<<<<<<< HEAD
        """Remove one session from memory."""
=======
        """
        Remove a session and its pending actions from memory.

        Args:
            session_id (str): The session ID.
        """
>>>>>>> main
        with self._lock:
            self._store.pop(session_id, None)
            self._pending_actions.pop(session_id, None)

<<<<<<< HEAD

=======
# Global instance of the session store
>>>>>>> main
session_store = SessionStore()
