# Despliegue

## Requisitos

- Python 3.11+
- Node.js 18+
- API keys: OpenAI (obligatorio), Tavily o Serper (para web search)

## Pasos

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Editar .env: OPENAI_API_KEY, TAVILY_API_KEY o SERPER_API_KEY
python main.py
```

Backend: `http://localhost:8001`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:3000`

## Variables de entorno (backend/.env)

| Variable | Descripción |
|----------|-------------|
| OPENAI_API_KEY | Obligatorio (LLM + embeddings) |
| ANTHROPIC_API_KEY | Alternativa a OpenAI |
| LLM_PROVIDER | openai \| anthropic |
| TAVILY_API_KEY | Búsqueda web (opcional) |
| SERPER_API_KEY | Alternativa a Tavily |
| CHROMA_DB_PATH | Ruta ChromaDB |
| ACTION_AUDIT_LOG_PATH | Ruta del audit log |
| TTS_PROVIDER | openai \| elevenlabs |
| ELEVENLABS_API_KEY | TTS con ElevenLabs (opcional) |
| STT_LANGUAGE | Idioma para Whisper (ej. es, en) |

## Variables frontend

| Variable | Descripción |
|----------|-------------|
| NEXT_PUBLIC_WS_URL | WebSocket URL |
| NEXT_PUBLIC_VOICE_FALLBACK | 1 para usar Web Speech API (sin backend STT/TTS) |

## Tests

```bash
cd backend
pytest -v
```
