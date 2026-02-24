"""Domain models for conversation and user profile context.

These models formalize state that was previously implicit in transport or prompt
layers, making future personalization and multi-tenant evolution easier.
"""

from __future__ import annotations

from pydantic import BaseModel, Field


class UserProfile(BaseModel):
    """User-level personalization and interaction preferences."""

    user_id: str = Field(..., min_length=1)
    display_name: str | None = None
    language: str = Field(default="en", min_length=2, max_length=10)
    warmth: float = Field(default=0.7, ge=0.0, le=1.0)
    verbosity: float = Field(default=0.5, ge=0.0, le=1.0)


class ConversationContext(BaseModel):
    """Conversation-scoped context for orchestration and policy decisions."""

    session_id: str = Field(..., min_length=1)
    user_id: str = Field(..., min_length=1)
    turn_count: int = Field(default=0, ge=0)
    locale: str = Field(default="en-US", min_length=2, max_length=16)
