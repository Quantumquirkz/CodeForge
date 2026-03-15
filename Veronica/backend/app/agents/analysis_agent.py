"""AnalysisAgent subgraph: deep analysis using RAG + LLM."""

from typing_extensions import TypedDict

from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.graph import StateGraph, START, END

from app.core.config import settings


class AnalysisAgentState(TypedDict, total=False):
    """State for the AnalysisAgent subgraph."""

    messages: list
    retrieved_context: list[str]
    output: str


def _create_analysis_subgraph():
    """Build the AnalysisAgent subgraph (stub for Phase 1)."""
    from langchain_openai import ChatOpenAI

    llm = ChatOpenAI(
        model=settings.llm_model,
        api_key=settings.openai_api_key,
        temperature=0.3,
    )

    system_prompt = """Eres un asistente analítico experto. Analiza el contenido proporcionado
y responde con profundidad y precisión. Si se te da contexto recuperado (RAG),
úsalo para enriquecer tu respuesta. Responde de forma clara y estructurada."""

    def analysis_node(state: AnalysisAgentState) -> dict:
        messages = state.get("messages", [])
        context = state.get("retrieved_context", [])
        context_str = "\n\n".join(context) if context else "No hay contexto adicional."
        last_msg = messages[-1] if messages else None
        user_content = last_msg.content if hasattr(last_msg, "content") else str(last_msg)
        prompt = f"Contexto recuperado:\n{context_str}\n\nPregunta del usuario:\n{user_content}"
        full_messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=prompt),
        ]
        response = llm.invoke(full_messages)
        return {"output": response.content}

    builder = StateGraph(AnalysisAgentState)
    builder.add_node("analyze", analysis_node)
    builder.add_edge(START, "analyze")
    builder.add_edge("analyze", END)
    return builder.compile()


analysis_subgraph = _create_analysis_subgraph()
