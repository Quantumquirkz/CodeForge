"""Speech-to-text via OpenAI Whisper API."""

import base64
import io
import tempfile

from app.core.config import settings


def transcribe_audio(audio_bytes: bytes, format: str = "webm") -> str:
    """
    Transcribe audio to text using OpenAI Whisper.
    Accepts raw audio bytes (webm, mp3, wav, etc.).
    """
    if not settings.openai_api_key:
        raise ValueError("OPENAI_API_KEY not configured for STT")

    from openai import OpenAI

    client = OpenAI(api_key=settings.openai_api_key)

    ext = "webm" if format == "webm" else format if format in ("mp3", "wav", "m4a") else "webm"
    with tempfile.NamedTemporaryFile(suffix=f".{ext}", delete=False) as f:
        f.write(audio_bytes)
        path = f.name

    try:
        with open(path, "rb") as f:
            response = client.audio.transcriptions.create(
                model="whisper-1",
                file=f,
                language=settings.stt_language or None,
            )
        return response.text.strip()
    finally:
        import os

        try:
            os.unlink(path)
        except OSError:
            pass


def transcribe_base64(audio_base64: str, format: str = "webm") -> str:
    """Transcribe base64-encoded audio."""
    audio_bytes = base64.b64decode(audio_base64)
    return transcribe_audio(audio_bytes, format=format)
