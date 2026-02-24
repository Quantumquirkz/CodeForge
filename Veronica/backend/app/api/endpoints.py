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
    ChatOutboundRequiresConfirmation,
)
from app.models.voice import VoiceProcessRequest, VoiceProcessResponse
from app.policy.action_guard import action_guard
from app.policy.confirmation import handle_confirmation_command
from app.voice.processor import voice_processor

app = FastAPI(title="Veronica AI Backend")


@app.get("/")
async def root() -> dict[str, str]:
<<<<<<< HEAD
    return {"message": "Veronica AI Backend is running."}



@app.websocket("/ws/chat")
async def websocket_chat(websocket: WebSocket) -> None:
    await websocket.accept()

=======
    """Root endpoint to verify the backend is running."""
    return {"message": "Veronica AI Backend is running."}

async def handle_confirmation(
    session_id: str, text: str, websocket: WebSocket
) -> bool:
    """
    Handle confirmation commands and send appropriate responses.

    Args:
        session_id: The session ID.
        text: The input text from the user.
        websocket: The WebSocket connection.

    Returns:
        bool: True if the command was handled, False otherwise.
    """
    handled, confirmation_response = handle_confirmation_command(
        session_id, text, session_store=session_store, action_guard=action_guard
    )
    if handled:
        await websocket.send_text(
            ChatOutboundChunk(text=confirmation_response).model_dump_json()
        )
        session_store.append_turn(session_id, text, confirmation_response)
        await websocket.send_text(ChatOutboundEnd().model_dump_json())
        return True
    return False

async def handle_policy_check(
    session_id: str, text: str, websocket: WebSocket
) -> bool:
    """
    Evaluate policy for the input text and handle confirmation if required.

    Args:
        session_id: The session ID.
        text: The input text from the user.
        websocket: The WebSocket connection.

    Returns:
        bool: True if the policy requires confirmation, False otherwise.
    """
    policy_result = action_guard.evaluate(text)
    if policy_result.requires_confirmation and policy_result.pending_action:
        session_store.set_pending_action(session_id, policy_result.pending_action)
        await websocket.send_text(
            ChatOutboundRequiresConfirmation(
                action_id=policy_result.pending_action.action_id,
                message=policy_result.response_message,
            ).model_dump_json()
        )
        session_store.append_turn(session_id, text, policy_result.response_message)
        await websocket.send_text(ChatOutboundEnd().model_dump_json())
        return True
    return False

@app.websocket("/ws/chat")
async def websocket_chat(websocket: WebSocket) -> None:
    """WebSocket endpoint for handling chat interactions."""
    await websocket.accept()
>>>>>>> main
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

<<<<<<< HEAD
            confirmation_result = handle_confirmation_command(
                session_id, payload.text, session_store=session_store, action_guard=action_guard
            )
            if confirmation_result.handled:
                await websocket.send_text(
                    ChatOutboundChunk(text=confirmation_result.response_message).model_dump_json()
                )
                session_store.append_turn(session_id, payload.text, confirmation_result.response_message)
                await websocket.send_text(ChatOutboundEnd().model_dump_json())
                continue

            policy_result = action_guard.evaluate(payload.text)
            if policy_result.requires_confirmation and policy_result.pending_action:
                session_store.set_pending_action(session_id, policy_result.pending_action)
                await websocket.send_text(
                    ChatOutboundRequiresConfirmation(
                        action_id=policy_result.pending_action.action_id,
                        message=policy_result.response_message,
                    ).model_dump_json()
                )
                session_store.append_turn(session_id, payload.text, policy_result.response_message)
                await websocket.send_text(ChatOutboundEnd().model_dump_json())
                continue

=======
            # Handle confirmation commands
            if await handle_confirmation(session_id, payload.text, websocket):
                continue

            # Check policy and handle confirmation if required
            if await handle_policy_check(session_id, payload.text, websocket):
                continue

            # Process the chat message
>>>>>>> main
            history = session_store.get_history(session_id)
            full_response = ""

            async for chunk in agent_orchestrator.astream_responses(payload.text, history):
                full_response += chunk
                response_chunk = ChatOutboundChunk(text=chunk)
                await websocket.send_text(response_chunk.model_dump_json())

            session_store.append_turn(session_id, payload.text, full_response)
            await websocket.send_text(ChatOutboundEnd().model_dump_json())

    except WebSocketDisconnect:
<<<<<<< HEAD
        return


@app.post("/voice/process", response_model=VoiceProcessResponse)
async def process_voice(request: VoiceProcessRequest) -> VoiceProcessResponse:
    """Process voice input and return both text and synthesized audio."""
=======
        print(f"WebSocket disconnected for session: {session_id}")

@app.post("/voice/process", response_model=VoiceProcessResponse)
async def process_voice(request: VoiceProcessRequest) -> VoiceProcessResponse:
    """
    Process voice input and return both text and synthesized audio.

    Args:
        request: The voice process request containing the audio file path.

    Returns:
        VoiceProcessResponse: The response containing user text, response text, and audio response.
    """
    if not request.audio_file_path:
        raise HTTPException(status_code=400, detail="Audio file path is required.")

>>>>>>> main
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
