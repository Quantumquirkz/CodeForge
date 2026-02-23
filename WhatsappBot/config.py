"""Backward-compatible configuration exports.

This module is kept for compatibility while the project migrates to `src/whatsapp_bot`.
"""

from __future__ import annotations

import sys
from pathlib import Path

SRC_PATH = Path(__file__).resolve().parent / "src"
if str(SRC_PATH) not in sys.path:
    sys.path.insert(0, str(SRC_PATH))

from whatsapp_bot.infrastructure.config.settings import settings

GROQ_API_KEY = settings.groq_api_key
GROQ_MODEL = settings.groq_model
GROQ_MAX_TOKENS = settings.groq_max_tokens
GROQ_TEMPERATURE = settings.groq_temperature

WHATSAPP_SESSION_PATH = settings.whatsapp_session_path
WHATSAPP_QR_PATH = settings.whatsapp_qr_path

BOT_NAME = settings.bot_name
BOT_LANGUAGE = settings.bot_language
ENABLE_LOGGING = settings.enable_logging
LOG_FILE = settings.log_file

MAX_RESPONSE_LENGTH = settings.max_response_length
ENABLE_CONTEXT = settings.enable_context
CONTEXT_MEMORY_SIZE = settings.context_memory_size

RATE_LIMIT_ENABLED = settings.rate_limit_enabled
RATE_LIMIT_MESSAGES = settings.rate_limit_messages
RATE_LIMIT_WINDOW = settings.rate_limit_window

VERIFY_TWILIO_SIGNATURE = settings.verify_twilio_signature
