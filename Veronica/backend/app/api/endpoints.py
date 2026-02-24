from __future__ import annotations

from uuid import uuid4

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect

from app.agents.orchestrator import agent_orchestrator
from app.api.chat_handler import handle_chat_message
from app.api.middleware import RequestContextLoggingMiddleware
from app.memory.session_store import session_store
from app.models.voice import VoiceProcessRequest, VoiceProcessResponse
from app.policy.action_guard import action_guard
from app.policy.confirmation import handle_confirmation_command
from app.voice.processor import voice_processor


def create_app() -> FastAPI:
    """Build FastAPI app with centralized middleware and route registration."""
    fastapi_app = FastAPI(title="Veronica AI Backend")
    fastapi_app.add_middleware(RequestContextLoggingMiddleware)

    @fastapi_app.get("/")
    async def root() -> dict[str, str]:
        return {"message": "Veronica AI Backend is running."}

    @fastapi_app.websocket("/ws/chat")
    async def websocket_chat(websocket: WebSocket) -> None:
        await websocket.accept()

        session_id = websocket.query_params.get("session_id") or str(uuid4())

        try:
            while True:
                raw_data = await websocket.receive_text()
                result = await handle_chat_message(
                    raw_data=raw_data,
                    session_id=session_id,
                    session_store=session_store,
                    action_guard=action_guard,
                    confirmation_handler=handle_confirmation_command,
                    orchestrator=agent_orchestrator,
                )
                for outbound_payload in result.outbound_messages:
                    await websocket.send_text(outbound_payload)
        except WebSocketDisconnect:
            return

    @fastapi_app.post("/voice/process", response_model=VoiceProcessResponse)
    async def process_voice(request: VoiceProcessRequest) -> VoiceProcessResponse:
        """Process voice input and return both text and synthesized audio."""
        if not request.audio_file_path:
            raise HTTPException(status_code=400, detail="Audio file path is required.")

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

    return fastapi_app


app = create_app()
