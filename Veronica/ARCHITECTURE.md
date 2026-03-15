# Arquitectura Veronica v2

## Vista general

```
User -> Frontend (Next.js) -> WebSocket -> FastAPI
                                        |
                                Orchestrator (LangGraph)
                                        |
                    +-------------------+-------------------+
                    |                   |                   |
              WebAgent          AnalysisAgent        CodeAgent
              (ingestión)       (RAG + LLM)         (tool gen)
                    |                   |                   |
              ChromaDB             ChromaDB           Sandbox
              Serper/Tavily        Retrieval          Plugin Registry
```

## Estructura del proyecto

| Capa   | Backend                             | Frontend        |
|--------|-------------------------------------|-----------------|
| API    | FastAPI, WebSocket /ws/chat         | Next.js App Router |
| Agents | LangGraph orchestrator, subgraphs   | useWebSocket    |
| Memory | ChromaDB, session_store             | -               |
| Policy | action_guard, audit_log, approval_gate | -            |

## Módulos principales

- **agents/orchestrator** - Grafo LangGraph con router y subagentes
- **agents/web_agent** - Búsqueda web + ingestión en ChromaDB
- **agents/analysis_agent** - Análisis profundo con RAG
- **agents/code_agent** - Generación de código de herramientas
- **voice** - stt (Whisper), tts (OpenAI/ElevenLabs)
- **ingestion** - web_scraper, chunker, pipeline, scheduler
- **memory** - vector_store (ChromaDB), session_store
- **plugins** - registry, generator, sandbox
- **policy** - action_guard, audit_log, approval_gate

## RAG

- Retriever invocado antes del AnalysisAgent
- Top-k documentos pasados como retrieved_context
- Embeddings: OpenAI text-embedding-3-small

## WebSocket

- Heartbeat: cliente envía ping cada 25s; servidor responde pong
- Tipos: message, voice_input, voice_output, subagent_progress, tool_generation_pending_approval, error

## Voz

- STT: Whisper API (audio base64 en voice_input)
- TTS: OpenAI o ElevenLabs (voice_output con audio base64)
- Fallback: Web Speech API con NEXT_PUBLIC_VOICE_FALLBACK=1

## ADRs

- [0001-veronica-langgraph-multi-agent](docs/adr/0001-veronica-langgraph-multi-agent.md)
- [0002-veronica-web-ingestion](docs/adr/0002-veronica-web-ingestion.md)
- [0003-veronica-plugin-generation](docs/adr/0003-veronica-plugin-generation.md)
- [0004-veronica-voice](docs/adr/0004-veronica-voice.md)
