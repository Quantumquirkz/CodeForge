"""Generate tool code from natural language description."""

from langchain_openai import ChatOpenAI

from app.core.config import settings

TOOL_TEMPLATE = '''
def run(**kwargs) -> str:
    """{docstring}"""
    try:
        # Implementation
        {implementation}
        return str(result)
    except Exception as e:
        return f"Error: {{e}}"
'''

SYSTEM_PROMPT = """Genera código Python para una herramienta. La función debe llamarse `run` y aceptar **kwargs, retornando str.
Solo usa: int, float, str, list, dict, len, sum, min, max, abs, round.
NO uses: open, subprocess, os, sys, import (excepto typing), network, eval, exec.
Responde SOLO con el código de la función run, sin explicaciones."""


def generate_tool_code(description: str) -> str:
    """Generate Python tool code from natural language description."""
    llm = ChatOpenAI(
        model=settings.llm_model,
        api_key=settings.openai_api_key,
        temperature=0.2,
    )
    prompt = f"Crear herramienta que: {description}"
    from langchain_core.messages import SystemMessage, HumanMessage

    response = llm.invoke([SystemMessage(content=SYSTEM_PROMPT), HumanMessage(content=prompt)])
    code = response.content if hasattr(response, "content") else str(response)
    if "def run(" not in code:
        code = "def run(**kwargs) -> str:\n    return \"No implementado\""
    return code.strip()
