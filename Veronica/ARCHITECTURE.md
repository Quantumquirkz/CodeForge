# Arquitectura

## Vista general

```
User -> Frontend (Next.js) -> WebSocket -> FastAPI
                                            |
                                    Orchestrator
                                            |
                +---------------------------+---------------------------+
                |                           |                           |
           LLM (GPT-4o)               ChromaDB                  Tool Registry
           Anthropic                  Memory                    (lights, email,
                                                                blockchain...)
```

## Estructura del proyecto

| Capa   | Backend                         | Frontend               |
|--------|----------------------------------|------------------------|
| API    | FastAPI, WebSockets, chat_handler| Next.js App Router     |
| Lógica | LangChain, agents, policy        | useWebSocket           |
| Datos  | ChromaDB, session_store          | -                      |
| UI     | -                                | ChatWindow, ChatInput  |

## Módulos principales

- **agents** - Orquestador LangChain, contexto con memoria
- **policy** - action_guard, confirmaciónes, audit log
- **memory** - ChromaDB persistente + session_store
- **tools** - control_lights, send_email, blockchain (opcional)
- **voice/vision** - Whisper, ElevenLabs, GPT-4o Vision

## Blockchain (opcional)

- Servicio: eth_getBalance, simulate_transfer
- Herramientas: get_wallet_balance, prepare_crypto_transfer
- Política: transferencias requieren confirmación
- Env: BLOCKCHAIN_ENABLED, BLOCKCHAIN_RPC_URL, etc.

## ADR Phase 1 Foundation

- Modelos de dominio explícitos
- Pipeline orquestador componible
- Protocolo de chat separado del transporte
- Middleware de logging y errores
- Tests base de websocket
