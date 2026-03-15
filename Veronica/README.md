# Veronica

Asistente de IA tipo J.A.R.V.I.S. con arquitectura multi-agente, RAG, ingestión web y auto-extensión mediante generación de herramientas.

## Documentación

| Archivo | Contenido |
|---------|-----------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Arquitectura LangGraph, subagentes, RAG, plugins |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Setup, variables de entorno, despliegue |
| [docs/adr/](docs/adr/) | ADRs: LangGraph, web ingestion, plugin generation |

## Capacidades

- **Multi-agente**: WebAgent (búsqueda/ingestión), AnalysisAgent (RAG + análisis), CodeAgent (generación de herramientas)
- **RAG**: ChromaDB + embeddings OpenAI para contexto recuperado
- **Ingestión web**: Serper/Tavily + scraping para aprender de la red
- **Auto-extensión**: Generación de plugins con aprobación humana y sandbox
- **Voz**: Comandos de voz (STT), respuestas habladas (TTS), modo conversación 1:1

## Configuración frontend

- **WebSocket URL**: En producción, define `NEXT_PUBLIC_WS_URL` (ej. `wss://api.tudominio.com/ws/chat`)
- **Voz fallback**: `NEXT_PUBLIC_VOICE_FALLBACK=1` para usar Web Speech API sin API keys
