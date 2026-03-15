"""Web scraping and search for ingestion pipeline."""

from typing import Any

import httpx

from app.core.config import settings


def search_web(query: str, num_results: int = 5) -> list[dict[str, Any]]:
    """Search the web. Uses Tavily or Serper if API keys present."""
    if settings.tavily_api_key:
        return _tavily_search(query, num_results)
    if settings.serper_api_key:
        return _serper_search(query, num_results)
    return []


def _tavily_search(query: str, num_results: int) -> list[dict[str, Any]]:
    try:
        from tavily import TavilyClient

        client = TavilyClient(api_key=settings.tavily_api_key)
        resp = client.search(query, max_results=num_results)
        return [
            {"title": r.get("title", ""), "url": r.get("url", ""), "snippet": r.get("content", "")}
            for r in resp.get("results", [])
        ]
    except Exception:
        return []


def _serper_search(query: str, num_results: int) -> list[dict[str, Any]]:
    try:
        with httpx.Client() as client:
            r = client.post(
                "https://google.serper.dev/search",
                json={"q": query, "num": num_results},
                headers={"X-API-KEY": settings.serper_api_key},
                timeout=10,
            )
            r.raise_for_status()
            data = r.json()
        return [
            {
                "title": it.get("title", ""),
                "url": it.get("link", ""),
                "snippet": it.get("snippet", ""),
            }
            for it in data.get("organic", [])[:num_results]
        ]
    except Exception:
        return []


def fetch_url_content(url: str) -> str:
    """Fetch and extract text from URL."""
    import re

    try:
        with httpx.Client(follow_redirects=True) as client:
            r = client.get(url, timeout=15)
            r.raise_for_status()
            html = r.text
        html = re.sub(r"<script[^>]*>.*?</script>", "", html, flags=re.DOTALL | re.I)
        html = re.sub(r"<style[^>]*>.*?</style>", "", html, flags=re.DOTALL | re.I)
        text = re.sub(r"<[^>]+>", " ", html)
        text = re.sub(r"\s+", " ", text).strip()
        return text[:15000]
    except Exception:
        return ""
