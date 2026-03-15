"""Text-to-speech via ElevenLabs or OpenAI TTS."""

import base64

from app.core.config import settings


def synthesize_speech(text: str) -> tuple[bytes, str]:
    """
    Synthesize text to speech.
    Returns (audio_bytes, format) e.g. (mp3_bytes, "mp3").
    """
    provider = settings.tts_provider or "openai"

    if provider == "elevenlabs" and settings.elevenlabs_api_key:
        return _elevenlabs_tts(text)
    if settings.openai_api_key:
        return _openai_tts(text)
    raise ValueError("No TTS provider configured (OPENAI_API_KEY or ELEVENLABS_API_KEY)")


def _openai_tts(text: str) -> tuple[bytes, str]:
    """OpenAI TTS (tts-1 or tts-1-hd)."""
    from openai import OpenAI

    client = OpenAI(api_key=settings.openai_api_key)
    response = client.audio.speech.create(
        model=settings.tts_model or "tts-1",
        voice=settings.tts_voice or "alloy",
        input=text,
    )
    return response.content, "mp3"


def _elevenlabs_tts(text: str) -> tuple[bytes, str]:
    """ElevenLabs TTS."""
    from elevenlabs.client import ElevenLabs

    client = ElevenLabs(api_key=settings.elevenlabs_api_key)
    audio = client.text_to_speech.convert(
        text=text,
        voice_id=settings.tts_voice or "21m00Tcm4TlvDq8ikWAM",
        model_id=settings.tts_model or "eleven_turbo_v2_5",
    )
    data = b"".join(audio)
    return data, "mp3"


def synthesize_to_base64(text: str) -> str:
    """Synthesize and return base64-encoded audio."""
    audio_bytes, fmt = synthesize_speech(text)
    return base64.b64encode(audio_bytes).decode("utf-8")
