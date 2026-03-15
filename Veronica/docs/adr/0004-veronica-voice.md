# ADR 0004: Funcionalidades de Voz

## Status

Accepted.

## Context

Veronica debe soportar comandos de voz, respuestas en voz y modo conversación 1:1.

## Decision

- STT: OpenAI Whisper API
- TTS: OpenAI TTS o ElevenLabs
- WebSocket: voice_input, voice_output con audio base64
- Fallback: Web Speech API con NEXT_PUBLIC_VOICE_FALLBACK=1

## Consequences

- OPENAI_API_KEY necesario para voz en servidor
- Fallback Web Speech solo en navegadores compatibles
