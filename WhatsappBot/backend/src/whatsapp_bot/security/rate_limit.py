from __future__ import annotations

import time


class InMemoryRateLimiter:
    def __init__(self, max_requests: int, window_seconds: int) -> None:
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._hits: dict[str, list[float]] = {}

    def allow(self, key: str) -> bool:
        now = time.time()
        window_start = now - self.window_seconds
        hits = [ts for ts in self._hits.get(key, []) if ts >= window_start]
        if len(hits) >= self.max_requests:
            self._hits[key] = hits
            return False
        hits.append(now)
        self._hits[key] = hits
        return True
