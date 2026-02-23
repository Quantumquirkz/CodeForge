from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from app.agents.orchestrator import agent_orchestrator
from app.voice.processor import voice_processor
from app.vision.processor import vision_processor
import json
import os

app = FastAPI(title="Veronica AI Backend")

@app.get("/")
async def root():
    return {"message": "Veronica AI Backend is running."}

@app.websocket("/ws/chat")
async def websocket_chat(websocket: WebSocket):
    await websocket.accept()
    history = []
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            user_input = message.get("text", "")
            
            # Stream response back
            async for chunk in agent_orchestrator.astream_responses(user_input, history):
                await websocket.send_text(json.dumps({"text": chunk, "type": "chunk"}))
            
            # Send end signal or final response if needed
            await websocket.send_text(json.dumps({"type": "end"}))
            
            # Update history (This is simplified; a better way would be to update it once after streaming)
            # For now, we'll let the orchestrator handle memory, but local history needs update for prompt
            # Note: The orchestrator already saves to memory. 
            # We should probably reconstruct the actual response for history here.
            # But since orchestrator uses memory search, history is less critical for long-term.
            
    except WebSocketDisconnect:
        print("Client disconnected")

@app.post("/voice/process")
async def process_voice(audio_file_path: str):
    # This is a simplified endpoint for processing voice
    text = voice_processor.transcribe_audio(audio_file_path)
    response_text = agent_orchestrator.run(text)
    audio_response = voice_processor.text_to_speech(response_text)
    
    return {
        "user_text": text,
        "response_text": response_text,
        "audio_response": audio_response.hex() # Sending as hex for demo
    }
