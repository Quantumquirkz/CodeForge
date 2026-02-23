from __future__ import annotations

import json
from uuid import uuid4

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import ValidationError

from app.agents.orchestrator import agent_orchestrator
from app.memory.session_store import session_store
from app.models.chat import (
    ChatInboundMessage,
    ChatOutboundChunk,
    ChatOutboundEnd,
    ChatOutboundError,
)
from app.models.voice import VoiceProcessRequest, VoiceProcessResponse
from app.voice.processor import voice_processor

app = FastAPI(title="Veronica AI Backend")


@app.get("/")
async def root() -> dict[str, str]:
    return {"message": "Veronica AI Backend is running."}


@app.websocket("/ws/chat")
async def websocket_chat(websocket: WebSocket) -> None:
    await websocket.accept()

    session_id = websocket.query_params.get("session_id") or str(uuid4())

    try:
        while True:
            raw_data = await websocket.receive_text()

            try:
                payload = ChatInboundMessage.model_validate(json.loads(raw_data))
            except (json.JSONDecodeError, ValidationError) as exc:
                error_payload = ChatOutboundError(message=f"Invalid payload: {exc}")
                await websocket.send_text(error_payload.model_dump_json())
                continue

            history = session_store.get_history(session_id)
            full_response = ""

            async for chunk in agent_orchestrator.astream_responses(payload.text, history):
                full_response += chunk
                response_chunk = ChatOutboundChunk(text=chunk)
                await websocket.send_text(response_chunk.model_dump_json())

            session_store.append_turn(session_id, payload.text, full_response)
            await websocket.send_text(ChatOutboundEnd().model_dump_json())

    except WebSocketDisconnect:
        return


@app.post("/voice/process", response_model=VoiceProcessResponse)
async def process_voice(request: VoiceProcessRequest) -> VoiceProcessResponse:
    """Process voice input and return both text and synthesized audio."""
    text = voice_processor.transcribe_audio(request.audio_file_path)
    if not text:
        raise HTTPException(status_code=400, detail="Audio transcription failed.")

    response_text = agent_orchestrator.run(text)
    audio_response = voice_processor.text_to_speech(response_text)

    return VoiceProcessResponse(
        user_text=text,
        response_text=response_text,
        audio_response=audio_response.hex(),
    )
