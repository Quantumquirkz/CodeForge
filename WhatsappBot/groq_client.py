"""Backward-compatible Groq client export."""

from __future__ import annotations

import sys
from pathlib import Path

SRC_PATH = Path(__file__).resolve().parent / "src"
if str(SRC_PATH) not in sys.path:
    sys.path.insert(0, str(SRC_PATH))

from whatsapp_bot.integrations.ai.groq_client import GroqClient

__all__ = ["GroqClient"]
