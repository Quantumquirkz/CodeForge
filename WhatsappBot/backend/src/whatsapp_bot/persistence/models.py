from __future__ import annotations

from datetime import datetime

from sqlalchemy import JSON, Boolean, DateTime, Float, Integer, String, Text, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class BotConfig(Base):
    __tablename__ = "bot_config"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    bot_name: Mapped[str] = mapped_column(String(120), default="Asistente Virtual")
    default_language: Mapped[str] = mapped_column(String(10), default="es")
    temperature: Mapped[float] = mapped_column(Float, default=0.7)
    max_tokens: Mapped[int] = mapped_column(Integer, default=500)
    context_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    context_memory_size: Mapped[int] = mapped_column(Integer, default=10)
    response_length_policy: Mapped[str] = mapped_column(String(20), default="balanced")
    emoji_policy: Mapped[str] = mapped_column(String(20), default="moderate")
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class PersonaProfile(Base):
    __tablename__ = "persona_profile"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    tone: Mapped[str] = mapped_column(String(30), default="friendly")
    formality: Mapped[int] = mapped_column(Integer, default=5)
    humor_level: Mapped[int] = mapped_column(Integer, default=3)
    brevity_level: Mapped[int] = mapped_column(Integer, default=6)
    signature_phrases: Mapped[list] = mapped_column(JSON, default=list)
    forbidden_phrases: Mapped[list] = mapped_column(JSON, default=list)
    writing_rules: Mapped[list] = mapped_column(JSON, default=list)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class WritingSample(Base):
    __tablename__ = "writing_sample"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    source: Mapped[str] = mapped_column(String(40), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    language: Mapped[str] = mapped_column(String(10), nullable=False)
    tags: Mapped[list] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class PersonaStyleGuide(Base):
    __tablename__ = "persona_style_guide"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    guide_text: Mapped[str] = mapped_column(Text, nullable=False)
    signals: Mapped[dict] = mapped_column(JSON, default=dict)
    sample_count: Mapped[int] = mapped_column(Integer, default=0)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class ConfigAuditLog(Base):
    __tablename__ = "config_audit_log"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    event_type: Mapped[str] = mapped_column(String(80), nullable=False)
    payload: Mapped[dict] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
