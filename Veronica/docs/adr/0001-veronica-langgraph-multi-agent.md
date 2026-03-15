# ADR 0001: Veronica LangGraph Multi-Agent Architecture

## Status

Accepted.

## Context

Veronica debe ser un asistente tipo JARVIS con arquitectura multi-agente, subagentes especializados y auto-extensión. Se requiere un orquestador que enrute mensajes a distintos subagentes (WebAgent, AnalysisAgent, CodeAgent) y herramientas.

## Decision

- Adoptar **LangGraph** como framework de orquestación.
- Grafo principal con nodo `router` que enruta condicionalmente a:
  - `web_agent`: búsqueda e ingestión web.
  - `analysis_agent`: análisis profundo con RAG.
  - `code_agent`: generación de herramientas.
  - `tool_executor`: ejecución de herramientas registradas.
- Cada subagente implementado como subgrafo con estado propio.
- Estado compartido `VeronicaState`: messages, session_id, retrieved_context, tool_results.

## Consequences

- Flujo explícito y depurable.
- Fácil añadir nuevos subagentes.
- Separación clara de responsabilidades.
