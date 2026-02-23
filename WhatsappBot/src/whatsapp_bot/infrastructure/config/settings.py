"""Runtime settings for WhatsAppBot."""

from __future__ import annotations

import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class Settings:
    """Centralized application settings loaded from environment variables."""

    groq_api_key: str = os.getenv("GROQ_API_KEY", "")
    groq_model: str = os.getenv("GROQ_MODEL", "llama-3.1-70b-versatile")
    groq_max_tokens: int = int(os.getenv("GROQ_MAX_TOKENS", "500"))
    groq_temperature: float = float(os.getenv("GROQ_TEMPERATURE", "0.7"))

    whatsapp_session_path: str = os.getenv("WHATSAPP_SESSION_PATH", "./sessions")
    whatsapp_qr_path: str = os.getenv("WHATSAPP_QR_PATH", "./qr_code.png")

    bot_name: str = os.getenv("BOT_NAME", "Asistente Virtual")
    bot_language: str = os.getenv("BOT_LANGUAGE", "es")
    enable_logging: bool = os.getenv("ENABLE_LOGGING", "true").lower() == "true"
    log_file: str = os.getenv("LOG_FILE", "./logs/bot.log")

    max_response_length: int = int(os.getenv("MAX_RESPONSE_LENGTH", "1000"))
    enable_context: bool = os.getenv("ENABLE_CONTEXT", "true").lower() == "true"
    context_memory_size: int = int(os.getenv("CONTEXT_MEMORY_SIZE", "10"))

    rate_limit_enabled: bool = os.getenv("RATE_LIMIT_ENABLED", "true").lower() == "true"
    rate_limit_messages: int = int(os.getenv("RATE_LIMIT_MESSAGES", "20"))
    rate_limit_window: int = int(os.getenv("RATE_LIMIT_WINDOW", "60"))

    verify_twilio_signature: bool = os.getenv("VERIFY_TWILIO_SIGNATURE", "false").lower() == "true"

    twilio_account_sid: str = os.getenv("TWILIO_ACCOUNT_SID", "")
    twilio_auth_token: str = os.getenv("TWILIO_AUTH_TOKEN", "")
    twilio_whatsapp_number: str = os.getenv("TWILIO_WHATSAPP_NUMBER", "")

    port: int = int(os.getenv("PORT", "5000"))


settings = Settings()
