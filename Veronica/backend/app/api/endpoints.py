"""FastAPI app and WebSocket chat endpoint."""

from fastapi import FastAPI, File, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.agents.orchestrator import process_message
from app.voice.stt import transcribe_base64
from app.voice.tts import synthesize_to_base64
from app.core.config import settings
from app.plugins.registry import list_plugins, get_plugin, register_plugin, save_plugin_to_disk
from app.policy.approval_gate import approve_plugin, reject_plugin

app = FastAPI(title="Veronica", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PluginApprovalRequest(BaseModel):
    session_id: str
    plugin_name: str
    code: str
    approved: bool


class SynthesizeRequest(BaseModel):
    text: str


@app.get("/health")
def health():
    """Health check."""
    return {"status": "ok"}


@app.get("/api/plugins")
def api_list_plugins():
    """List registered plugins."""
    return {"plugins": list_plugins()}


@app.post("/api/plugins/approve")
def api_approve_plugin(req: PluginApprovalRequest):
    """Approve or reject a generated plugin."""
    if req.approved:
        try:
            exec_globals: dict = {}
            exec(req.code, exec_globals)
            run_fn = exec_globals.get("run")
            if run_fn and callable(run_fn):
                register_plugin(req.plugin_name, run_fn)
                save_plugin_to_disk(req.plugin_name, req.code)
                approve_plugin(req.session_id, req.plugin_name, req.code)
                return {"status": "approved", "plugin_name": req.plugin_name}
        except Exception as e:
            return {"status": "error", "error": str(e)}
    reject_plugin(req.session_id, req.plugin_name)
    return {"status": "rejected"}


@app.post("/api/voice/transcribe")
async def api_voice_transcribe(audio: UploadFile = File(...)):
    """Transcribe audio file to text (multipart/form-data)."""
    try:
        data = await audio.read()
        format_str = audio.filename.split(".")[-1] if audio.filename else "webm"
        text = transcribe_audio(data, format=format_str)
        return {"text": text}
    except Exception as e:
        return {"error": str(e), "text": ""}


@app.post("/api/voice/synthesize")
def api_voice_synthesize(req: SynthesizeRequest):
    """Synthesize text to speech. Returns JSON with audio_base64 and format."""
    try:
        audio_b64 = synthesize_to_base64(req.text)
        return {"audio_base64": audio_b64, "format": "mp3"}
    except Exception as e:
        return {"error": str(e), "audio_base64": "", "format": ""}


@app.websocket("/ws/chat")
async def websocket_chat(websocket: WebSocket):
    """WebSocket endpoint for chat with heartbeat."""
    await websocket.accept()
    session_id = "default"
    try:
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type", "message")
            if msg_type == "ping":
                await websocket.send_json({"type": "pong"})
                continue
            if msg_type == "voice_input":
                audio_b64 = data.get("audio_base64", "")
                fmt = data.get("format", "webm")
                sid = data.get("session_id") or session_id
                session_id = sid
                if not audio_b64:
                    await websocket.send_json({"type": "error", "error": "Empty audio"})
                    continue
                try:
                    text = transcribe_base64(audio_b64, format=fmt)
                    if not text.strip():
                        await websocket.send_json({"type": "error", "error": "No speech detected"})
                        continue
                    response = process_message(text, session_id=session_id)
                    audio_out = synthesize_to_base64(response)
                    await websocket.send_json(
                        {
                            "type": "message",
                            "role": "assistant",
                            "content": response,
                        }
                    )
                    await websocket.send_json(
                        {
                            "type": "voice_output",
                            "audio_base64": audio_out,
                            "format": "mp3",
                        }
                    )
                except Exception as e:
                    await websocket.send_json({"type": "error", "error": str(e)})
            elif msg_type == "message":
                text = data.get("text", "").strip()
                if not text:
                    await websocket.send_json(
                        {"type": "error", "error": "Empty message"}
                    )
                    continue
                sid = data.get("session_id") or session_id
                session_id = sid
                response = process_message(text, session_id=session_id)
                await websocket.send_json(
                    {
                        "type": "message",
                        "role": "assistant",
                        "content": response,
                    }
                )
                if data.get("request_tts"):
                    try:
                        audio_out = synthesize_to_base64(response)
                        await websocket.send_json(
                            {"type": "voice_output", "audio_base64": audio_out, "format": "mp3"}
                        )
                    except Exception:
                        pass
            elif msg_type == "session":
                session_id = data.get("session_id", session_id)
    except WebSocketDisconnect:
        pass
    except Exception as e:
        try:
            await websocket.send_json(
                {"type": "error", "error": str(e)}
            )
        except Exception:
            pass
