# Despliegue

## Requisitos

- Python 3.11+
- Node.js 18+
- Docker y Docker Compose
- API keys: OpenAI, Anthropic, ElevenLabs (opcional para voz)

## Pasos

### 1. Servicios (ChromaDB)

```bash
docker-compose up -d
```

### 2. Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Editar .env y añadir API keys
python main.py
```

Backend en: `http://localhost:8001`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend en: `http://localhost:3000`

## Variables de entorno (.env en backend/)

| Variable | Descripción |
|----------|-------------|
| OPENAI_API_KEY | Obligatorio para LLM |
| ANTHROPIC_API_KEY | Alternativa a OpenAI |
| ELEVENLABS_API_KEY | Opcional, para TTS |
| CHROMA_DB_PATH | Ruta ChromaDB (default: ./chroma_db) |
| BLOCKCHAIN_* | Solo si usas blockchain |

## Tests

```bash
cd backend
pytest -v
```
