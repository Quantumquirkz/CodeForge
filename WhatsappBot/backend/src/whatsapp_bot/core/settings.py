from __future__ import annotations

import os

from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = Field(
        default="postgresql+psycopg2://postgres:postgres@localhost:5432/whatsapp_bot"
    )
    groq_api_key: str = ""
    groq_model: str = "llama-3.1-70b-versatile"
    port: int = 5000
    debug: bool = False

    rate_limit_window: int = 60
    admin_rate_limit_messages: int = 40

    admin_unsafe_no_auth: bool = False
    admin_api_token: str = ""
    admin_allowed_origins: list[str] = Field(default_factory=lambda: ["http://localhost:5173"])
    verify_twilio_signature: bool = True
    twilio_auth_token: str = ""
    auto_create_schema: bool = True

    persona_max_samples: int = 100
    persona_style_max_chars: int = 3500

    class Config:
        env_file = ".env"
        case_sensitive = False

    @property
    def admin_public_risk(self) -> bool:
        return self.admin_unsafe_no_auth


settings = Settings(
    admin_allowed_origins=[
        item.strip()
        for item in os.getenv("ADMIN_ALLOWED_ORIGINS", "http://localhost:5173").split(",")
        if item.strip()
    ]
)
