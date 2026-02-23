"""In-memory rate limiter for incoming requests."""

from __future__ import annotations

import time
from collections import defaultdict, deque


class InMemoryRateLimiter:
    """Simple sliding-window limiter by key."""

    def __init__(self, max_requests: int, window_seconds: int) -> None:
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._events: dict[str, deque[float]] = defaultdict(deque)

    def allow(self, key: str) -> bool:
        """Return True if request is allowed for the given key."""
        now = time.time()
        queue = self._events[key]
        cutoff = now - self.window_seconds

        while queue and queue[0] < cutoff:
            queue.popleft()

        if len(queue) >= self.max_requests:
            return False

        queue.append(now)
        return True
