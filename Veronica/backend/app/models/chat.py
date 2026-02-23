"""Chat-related API schemas.

These models define strict payload contracts for websocket chat interactions
and keep message validation centralized.
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
