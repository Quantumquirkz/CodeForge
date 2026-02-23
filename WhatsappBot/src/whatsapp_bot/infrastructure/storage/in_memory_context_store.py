"""In-memory conversation context storage."""

from __future__ import annotations

from collections import defaultdict
from typing import DefaultDict


class InMemoryContextStore:
    """Stores conversation history per user in-memory."""

    def __init__(self, memory_size: int) -> None:
        self.memory_size = memory_size
        self._store: DefaultDict[str, list[dict[str, str]]] = defaultdict(list)

    def get_history(self, user_id: str) -> list[dict[str, str]]:
        return self._store[user_id]

    def append(self, user_id: str, role: str, content: str) -> None:
        self._store[user_id].append({"role": role, "content": content})
        max_len = self.memory_size * 2
        if len(self._store[user_id]) > max_len:
            self._store[user_id] = self._store[user_id][-max_len:]
