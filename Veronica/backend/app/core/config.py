"""Application configuration."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # LLM
    openai_api_key: str = ""
    anthropic_api_key: str = ""
    llm_provider: str = "openai"  # openai | anthropic
    llm_model: str = "gpt-4o"

    # Embeddings
    embeddings_model: str = "text-embedding-3-small"

    # ChromaDB
    chroma_db_path: str = "./chroma_db"
    chroma_collection_name: str = "veronica_knowledge"
    plugins_dir: str = "./plugins"

    # Web search
    tavily_api_key: str = ""
    serper_api_key: str = ""

    # Policy
    action_audit_log_path: str = "./logs/action_audit.jsonl"
    max_tools_per_session: int = 5
    max_plugin_executions: int = 100

    # Voice
    voice_enabled: bool = True
    tts_provider: str = "openai"  # openai | elevenlabs
    tts_model: str = "tts-1"
    tts_voice: str = "alloy"  # OpenAI: alloy, echo, fable, onyx, nova, shimmer
    elevenlabs_api_key: str = ""
    stt_language: str = ""  # e.g. es, en; empty = auto-detect

    # Server
    host: str = "0.0.0.0"
    port: int = 8001
    cors_origins: list[str] = ["http://localhost:3000"]


settings = Settings()
