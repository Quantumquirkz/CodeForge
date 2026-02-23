"""
Chat-related API schemas.

This module defines strict payload contracts for WebSocket chat interactions,
ensuring message validation is centralized and consistent.
"""

from pydantic import BaseModel, Field

class ChatInboundMessage(BaseModel):
    """
    User chat payload received over WebSocket.

    Attributes:
        text (str): The user's input text. Must be between 1 and 4000 characters.
    """
    text: str = Field(..., min_length=1, max_length=4000, description="User's input text.")

class ChatOutboundChunk(BaseModel):
    """
    Chunk of assistant response streamed to the client.

    Attributes:
        type (str): The type of the message, always "chunk".
        text (str): The text content of the chunk. Must be at least 1 character.
    """
    type: str = Field(default="chunk", description="Message type identifier.")
    text: str = Field(..., min_length=1, description="Text content of the chunk.")

class ChatOutboundEnd(BaseModel):
    """
    Signal indicating that one streamed response is complete.

    Attributes:
        type (str): The type of the message, always "end".
    """
    type: str = Field(default="end", description="Message type identifier.")

class ChatOutboundError(BaseModel):
    """
    Error payload returned to WebSocket client.

    Attributes:
        type (str): The type of the message, always "error".
        message (str): The error message. Must be at least 1 character.
    """
    type: str = Field(default="error", description="Message type identifier.")
    message: str = Field(..., min_length=1, description="Error message.")

class ChatOutboundRequiresConfirmation(BaseModel):
    """
    Payload requesting explicit user confirmation for a sensitive action.

    Attributes:
        type (str): The type of the message, always "requires_confirmation".
        action_id (str): The ID of the action requiring confirmation. Must be at least 1 character.
        message (str): The confirmation message. Must be at least 1 character.
    """
    type: str = Field(default="requires_confirmation", description="Message type identifier.")
    action_id: str = Field(..., min_length=1, description="ID of the action requiring confirmation.")
    message: str = Field(..., min_length=1, description="Confirmation message.")
