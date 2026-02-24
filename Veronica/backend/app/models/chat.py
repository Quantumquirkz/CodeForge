"""Chat-related API schemas.

This module defines strict payload contracts for WebSocket chat interactions,
ensuring message validation is centralized and consistent.
"""

from pydantic import BaseModel, Field


class ChatInboundMessage(BaseModel):
    """User chat payload received over websocket."""

    text: str = Field(..., min_length=1, max_length=4000)


class ChatOutboundChunk(BaseModel):
    """Chunk of assistant response streamed to the client."""

    type: str = Field(default="chunk")
    text: str = Field(..., min_length=1)


class ChatOutboundEnd(BaseModel):
    """Signal indicating that one streamed response is complete."""

    type: str = Field(default="end")


class ChatOutboundError(BaseModel):
    """Error payload returned to websocket client."""

    type: str = Field(default="error")
    message: str = Field(..., min_length=1)


class ChatOutboundRequiresConfirmation(BaseModel):
    """Payload requesting explicit user confirmation for a sensitive action."""

    type: str = Field(default="requires_confirmation")
    action_id: str = Field(..., min_length=1)
    message: str = Field(..., min_length=1)
