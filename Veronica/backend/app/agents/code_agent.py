"""CodeAgent subgraph: generates tool code from natural language."""

from typing_extensions import TypedDict

from langgraph.graph import StateGraph, START, END

from app.plugins.generator import generate_tool_code
from app.plugins.sandbox import execute_in_sandbox


class CodeAgentState(TypedDict, total=False):
    """State for CodeAgent subgraph."""

    description: str
    generated_code: str
    sandbox_result: str
    output: str
    pending_approval: bool


def _create_code_agent_subgraph():
    """Build CodeAgent subgraph: generate -> sandbox test -> output (pending approval)."""

    def generate_node(state: CodeAgentState) -> dict:
        desc = state.get("description", "")
        code = generate_tool_code(desc) if desc else "def run(**kwargs): return 'No description'"
        return {"generated_code": code}

    def sandbox_test_node(state: CodeAgentState) -> dict:
        code = state.get("generated_code", "")
        result = execute_in_sandbox(code) if code else "No code"
        return {"sandbox_result": result, "output": f"Código generado. Prueba en sandbox: {result}"}

    builder = StateGraph(CodeAgentState)
    builder.add_node("generate", generate_node)
    builder.add_node("sandbox_test", sandbox_test_node)
    builder.add_edge(START, "generate")
    builder.add_edge("generate", "sandbox_test")
    builder.add_edge("sandbox_test", END)
    return builder.compile()


code_agent_subgraph = _create_code_agent_subgraph()
