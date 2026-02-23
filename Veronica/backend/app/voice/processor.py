import whisper_timestamped as whisper
from elevenlabs.client import ElevenLabs
from app.core.config import settings
import os

class VoiceProcessor:
    def __init__(self):
        self.tts_client = None
        if settings.ELEVENLABS_API_KEY:
            self.tts_client = ElevenLabs(api_key=settings.ELEVENLABS_API_KEY)
        
        # Load a small whisper model for STT
        # In a real low-latency scenario, we might use a dedicated API or faster-whisper
        self.stt_model = whisper.load_model("base")

    def transcribe_audio(self, audio_path: str) -> str:
        """Transcribes audio file to text."""
        if not os.path.exists(audio_path):
            return ""
        
        audio = whisper.load_audio(audio_path)
        result = whisper.transcribe(self.stt_model, audio)
        return result["text"]

    def text_to_speech(self, text: str) -> bytes:
        """Converts text to speech audio bytes."""
        if not self.tts_client:
            print("ElevenLabs API Key missing. Returning mock audio.")
            return b"MOCK_AUDIO_DATA"

        audio_generator = self.tts_client.generate(
            text=text,
            voice="Rachel", # Default personality
            model="eleven_monolingual_v1"
        )
        return b"".join(chunk for chunk in audio_generator)

voice_processor = VoiceProcessor()
