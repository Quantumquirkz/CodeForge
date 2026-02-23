"""Backward-compatible prompt exports."""

from __future__ import annotations

import sys
from pathlib import Path

SRC_PATH = Path(__file__).resolve().parent / "src"
if str(SRC_PATH) not in sys.path:
    sys.path.insert(0, str(SRC_PATH))

from whatsapp_bot.prompts.templates import (
    COMPLAINT_PROMPT,
    FAREWELL_PROMPT,
    FAREWELLS_BY_LANGUAGE,
    GREETING_PROMPT,
    GREETINGS_BY_LANGUAGE,
    QUESTION_PROMPT,
    SYSTEM_PROMPT,
    TECHNICAL_SUPPORT_PROMPT,
)
