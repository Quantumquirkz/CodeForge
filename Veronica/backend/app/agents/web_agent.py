"""WebAgent subgraph: web search + ingestion into vector store."""

from typing_extensions import TypedDict

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langgraph.graph import StateGraph, START, END

from app.core.config import settings
from app.ingestion.pipeline import run_ingestion_pipeline


class WebAgentState(TypedDict, total=False):
    """State for WebAgent subgraph."""

    query: str
    search_results: list
    ingestion_count: int
    output: str


def _create_web_agent_subgraph():
    """Build WebAgent subgraph: search + ingest + respond."""

    def search_and_ingest_node(state: WebAgentState) -> dict:
        query = state.get("query", "")
        if not query:
            return {"output": "No se proporcionó consulta."}
        count = run_ingestion_pipeline(query, num_search_results=5, max_urls_to_scrape=3)
        return {
            "ingestion_count": count,
            "output": f"Búsqueda e ingestión completadas. Se añadieron {count} fragmentos al conocimiento.",
        }

    builder = StateGraph(WebAgentState)
    builder.add_node("search_ingest", search_and_ingest_node)
    builder.add_edge(START, "search_ingest")
    builder.add_edge("search_ingest", END)
    return builder.compile()


web_agent_subgraph = _create_web_agent_subgraph()
