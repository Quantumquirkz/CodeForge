from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    ELEVENLABS_API_KEY: Optional[str] = None

    CHROMA_DB_PATH: str = "./chroma_db"
    LOG_LEVEL: str = "INFO"

    VERONICA_PERSONA: str = (
        "You are Veronica, an AI assistant inspired by J.A.R.V.I.S. with a philosophy of "
        "Empathetic Intelligence. You are kind, polite, proactive, and warm."
    )

    BLOCKCHAIN_ENABLED: bool = False
    BLOCKCHAIN_NETWORK: str = "ethereum"
    BLOCKCHAIN_RPC_URL: Optional[str] = None
    BLOCKCHAIN_DEFAULT_WALLET: Optional[str] = None

    ACTION_AUDIT_LOG_PATH: str = "./audit/actions.jsonl"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
