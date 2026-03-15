"""Main LangGraph orchestrator with router and subagent dispatch."""


from langchain_core.messages import AIMessage, HumanMessage
from langgraph.graph import StateGraph, START, END

from app.agents.analysis_agent import analysis_subgraph
from app.agents.state import VeronicaState
from app.agents.web_agent import web_agent_subgraph
from app.agents.code_agent import code_agent_subgraph

# Lazy import to avoid circular dependency
from app.core.config import settings


def _get_llm():
    """Return configured LLM based on provider."""
    if settings.llm_provider == "anthropic":
        from langchain_anthropic import ChatAnthropic

        return ChatAnthropic(
            model=settings.llm_model,
            api_key=settings.anthropic_api_key,
            temperature=0.5,
        )
    from langchain_openai import ChatOpenAI

    return ChatOpenAI(
        model=settings.llm_model,
        api_key=settings.openai_api_key,
        temperature=0.5,
    )


def _route(state: VeronicaState) -> str:
    """
    Route to appropriate subagent or tool.
    """
    messages = state.get("messages", [])
    if not messages:
        return "analysis_agent"
    last_msg = messages[-1]
    if hasattr(last_msg, "tool_calls") and last_msg.tool_calls:
        return "tool_executor"
    content = getattr(last_msg, "content", str(last_msg)).lower()
    web_triggers = ["buscar en la web", "aprender sobre", "ingerir", "ingesta web"]
    if any(t in content for t in web_triggers):
        return "web_agent"
    code_triggers = ["crear herramienta", "generar plugin", "nueva herramienta"]
    if any(t in content for t in code_triggers):
        return "code_agent"
    return "analysis_agent"


def call_code_agent(state: VeronicaState) -> dict:
    """Wrap CodeAgent subgraph invocation."""
    messages = state.get("messages", [])
    last = messages[-1] if messages else None
    desc = getattr(last, "content", str(last)) if last else ""
    result = code_agent_subgraph.invoke({"description": desc})
    output = result.get("output", "No se pudo generar la herramienta.")
    return {
        "messages": messages + [AIMessage(content=output)],
        "final_response": output,
    }


def call_web_agent(state: VeronicaState) -> dict:
    """Wrap WebAgent subgraph invocation."""
    messages = state.get("messages", [])
    last = messages[-1] if messages else None
    query = getattr(last, "content", str(last)) if last else ""
    result = web_agent_subgraph.invoke({"query": query})
    output = result.get("output", "")
    return {
        "messages": messages + [AIMessage(content=output)],
        "final_response": output,
    }


def call_analysis_agent(state: VeronicaState) -> dict:
    """Wrap AnalysisAgent subgraph invocation; map parent state to subgraph state."""
    messages = state.get("messages", [])
    context = state.get("retrieved_context", [])
    subgraph_input = {
        "messages": messages,
        "retrieved_context": context,
    }
    result = analysis_subgraph.invoke(subgraph_input)
    output = result.get("output", "")
    return {
        "messages": messages + [AIMessage(content=output)],
        "final_response": output,
    }


def tool_executor_node(state: VeronicaState) -> dict:
    """Execute tools. Phase 1: stub - no tools registered yet."""
    messages = state.get("messages", [])
    return {"messages": messages}


def build_graph():
    """Build and compile the main Veronica orchestrator graph."""

    builder = StateGraph(VeronicaState)

    def router_node(state: VeronicaState) -> dict:
        """Passthrough; routing is done by conditional_edges."""
        return {}

    builder.add_node("router", router_node)
    builder.add_node("web_agent", call_web_agent)
    builder.add_node("code_agent", call_code_agent)
    builder.add_node("analysis_agent", call_analysis_agent)
    builder.add_node("tool_executor", tool_executor_node)

    builder.add_edge(START, "router")
    builder.add_conditional_edges(
        "router",
        _route,
        {
            "web_agent": "web_agent",
            "code_agent": "code_agent",
            "analysis_agent": "analysis_agent",
            "tool_executor": "tool_executor",
        },
    )
    builder.add_edge("web_agent", END)
    builder.add_edge("code_agent", END)
    builder.add_edge("analysis_agent", END)
    builder.add_edge("tool_executor", END)

    return builder.compile()


graph = build_graph()


def _retrieve_context(query: str, top_k: int = 5) -> list[str]:
    """Retrieve relevant context from vector store for RAG."""
    try:
        from app.memory.vector_store import get_retriever

        retriever = get_retriever(top_k=top_k)
        docs = retriever.invoke(query)
        return [d.page_content for d in docs]
    except Exception:
        return []


def process_message(
    message: str,
    session_id: str = "default",
    retrieved_context: list[str] | None = None,
) -> str:
    """
    Process a user message through the orchestrator graph.
    Returns the assistant's response.
    """
    context = retrieved_context if retrieved_context is not None else _retrieve_context(message)
    initial_state: VeronicaState = {
        "messages": [HumanMessage(content=message)],
        "session_id": session_id,
        "retrieved_context": context,
        "tool_results": [],
    }
    result = graph.invoke(initial_state)
    return result.get("final_response", "") or (
        result.get("messages", [])[-1].content
        if result.get("messages")
        else "No pude generar una respuesta."
    )
