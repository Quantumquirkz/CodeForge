"""Voice API schemas."""

from pydantic import BaseModel, Field


class VoiceProcessRequest(BaseModel):
    """Input model for voice processing endpoint."""

    audio_file_path: str = Field(..., min_length=1, max_length=2048)


class VoiceProcessResponse(BaseModel):
    """Output model for processed voice interactions."""

    user_text: str
    response_text: str
    audio_response: str
