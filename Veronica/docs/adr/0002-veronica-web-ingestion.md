# ADR 0002: Web Ingestion for RAG

## Status

Accepted.

## Context

Veronica debe conectarse a la red y aprender del mundo. Se necesita un pipeline para ingerir contenido web en la base vectorial (ChromaDB) y usarlo en RAG.

## Decision

- **Búsqueda**: Serper API o Tavily según API key disponible.
- **Scraping**: HTTP simple (httpx) sin JS; extracción de texto con regex.
- **Chunking**: RecursiveCharacterTextSplitter o chunk manual ~800 tokens.
- **Metadata**: source_url, timestamp, topic.
- **Scheduler**: APScheduler para ingestión periódica opcional.

## Consequences

- RAG actualizado con conocimiento de la web.
- Dependencia de APIs externas (Serper/Tavily).
- Sin JS rendering: páginas SPA no se procesan bien.
