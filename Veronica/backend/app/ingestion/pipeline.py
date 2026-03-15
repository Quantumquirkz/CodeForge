"""Run full ingestion pipeline: search -> scrape -> chunk -> embed -> store."""

from datetime import datetime

from app.ingestion.web_scraper import search_web, fetch_url_content
from app.ingestion.chunker import chunk_texts
from app.memory.vector_store import add_documents


def run_ingestion_pipeline(
    query: str,
    num_search_results: int = 5,
    max_urls_to_scrape: int = 3,
) -> int:
    """
    Search web, scrape URLs, chunk, and add to vector store.
    Returns number of chunks added.
    """
    results = search_web(query, num_results=num_search_results)
    texts = []
    metadatas = []
    for item in results[:max_urls_to_scrape]:
        url = item.get("url", "")
        if not url:
            continue
        content = fetch_url_content(url)
        if content:
            texts.append(content)
            metadatas.append({
                "source_url": url,
                "timestamp": datetime.utcnow().isoformat(),
                "topic": query,
                "title": item.get("title", ""),
            })
    if not texts:
        return 0
    chunks = chunk_texts(texts, chunk_size=800, chunk_overlap=150)
    chunk_count = min(len(chunks), 50)
    per_doc = chunk_count // len(metadatas) or 1
    meta_expanded = []
    for m in metadatas:
        meta_expanded.extend([m] * per_doc)
    while len(meta_expanded) < chunk_count:
        meta_expanded.append(metadatas[-1])
    add_documents(chunks[:chunk_count], metadatas=meta_expanded[:chunk_count])
    return len(chunks)
