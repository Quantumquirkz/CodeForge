# Environment variables reference

This document lists environment variables used across CodeForge projects. **Do not put real secrets in the repository.** Use `.env` (gitignored) and copy from each project's `.env.example`.

---

## WhatsappBot

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GROQ_API_KEY` | Yes | `""` | Groq API key (LLM) |
| `GROQ_MODEL` | No | `llama-3.1-70b-versatile` | Model identifier |
| `GROQ_MAX_TOKENS` | No | `500` | Max response tokens |
| `GROQ_TEMPERATURE` | No | `0.7` | Sampling temperature |
| `HOST` | No | `0.0.0.0` | Server bind address |
| `PORT` | No | `5000` | Server port |
| `LOG_LEVEL` | No | `INFO` | Logging level |
| `TWILIO_ACCOUNT_SID` | If using Twilio | `""` | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | If using Twilio | `""` | Twilio auth token (for signature verification) |
| `TWILIO_VERIFY_SIGNATURE` | No | `false` | Set `true` in production to validate webhook signatures |
| `TWILIO_WHATSAPP_NUMBER` | No | `""` | Twilio WhatsApp number |
| `REDIS_URL` | No | `None` | Redis URL for rate limiter (e.g. `redis://localhost:6379`) |
| `REDIS_DISABLED` | No | `true` | Set `false` to use Redis when `REDIS_URL` is set |
| `RATE_LIMIT_MESSAGES` | No | `20` | Requests per window |
| `RATE_LIMIT_WINDOW` | No | `60` | Window in seconds |
| `ENABLE_CONTEXT` | No | `true` | Conversation context per user |
| `CONTEXT_MEMORY_SIZE` | No | `10` | Messages to keep per user |

---

## WhatsAppAssistant

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | - | PostgreSQL connection string (with pgvector) |
| `GROQ_API_KEY` | Yes | - | Groq API key for LLM |
| `REDIS_URL` | No | - | Redis URL for Bull queue; if missing, in-memory queue is used |
| `CORS_ORIGIN` | No | - | Allowed origin for production (e.g. `https://app.example.com`) |
| `WA_SESSION_PATH` | No | `./.wwebjs_auth` | Path for whatsapp-web.js session persistence |

---

## Veronica

### Backend

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| (LLM keys) | Depends on tools | - | OpenAI/Anthropic API keys as required by LangChain |
| `ACTION_AUDIT_LOG_PATH` | No | - | Path for policy audit log (JSONL) |
| `BLOCKCHAIN_ENABLED` | No | - | Enable blockchain tools |
| `BLOCKCHAIN_RPC_URL` | If blockchain | - | Ethereum RPC URL |

### Frontend

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_WS_URL` | No | `ws://localhost:8001/ws/chat` | WebSocket URL for chat (use `wss://` in production) |

---

## TheoreticalResearch / Don Bosco Climate

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| (See `config.py`) | No | - | Paths and analysis parameters are in code; override via env if added in config |

---

For production, use a secrets manager or vault; keep `.env.example` as a template only and never commit real values.
