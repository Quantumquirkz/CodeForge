from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field, field_validator


class BotConfigDTO(BaseModel):
    bot_name: str = Field(min_length=1, max_length=120)
    default_language: str = Field(default="es", min_length=2, max_length=10)
    temperature: float = Field(default=0.7, ge=0.0, le=2.0)
    max_tokens: int = Field(default=500, ge=1, le=4000)
    context_enabled: bool = True
    context_memory_size: int = Field(default=10, ge=1, le=100)
    response_length_policy: Literal["short", "balanced", "long"] = "balanced"
    emoji_policy: Literal["none", "moderate", "high"] = "moderate"


class PersonaProfileDTO(BaseModel):
    tone: str = Field(default="friendly", min_length=1, max_length=30)
    formality: int = Field(default=5, ge=1, le=10)
    humor_level: int = Field(default=3, ge=1, le=10)
    brevity_level: int = Field(default=6, ge=1, le=10)
    signature_phrases: list[str] = Field(default_factory=list)
    forbidden_phrases: list[str] = Field(default_factory=list)
    writing_rules: list[str] = Field(default_factory=list)


class WritingSampleCreateDTO(BaseModel):
    source: str = Field(default="manual", min_length=1, max_length=40)
    content: str = Field(min_length=1)
    language: str = Field(default="es", min_length=2, max_length=10)
    tags: list[str] = Field(default_factory=list)

    @field_validator("content")
    @classmethod
    def validate_content(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("content must not be empty")
        return cleaned


class WritingSampleDTO(WritingSampleCreateDTO):
    id: int
    created_at: str


class RebuildResponseDTO(BaseModel):
    style_preview: str
    sample_count: int
    signals: dict
