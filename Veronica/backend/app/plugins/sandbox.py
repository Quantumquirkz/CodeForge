"""Sandbox for executing generated plugin code safely."""

import builtins
from typing import Any

ALLOWED = {
    "abs", "all", "any", "bool", "dict", "enumerate", "float", "int", "len",
    "list", "max", "min", "range", "round", "sorted", "str", "sum", "tuple",
    "zip", "Exception", "ValueError", "TypeError", "KeyError",
}


def execute_in_sandbox(code: str, **kwargs: Any) -> str:
    """Execute tool code in restricted environment."""
    safe_builtins = {k: getattr(builtins, k) for k in ALLOWED if hasattr(builtins, k)}
    g: dict[str, Any] = {"__builtins__": safe_builtins}
    l: dict[str, Any] = {}
    try:
        exec(code, g, l)
        run_fn = l.get("run")
        if run_fn and callable(run_fn):
            return str(run_fn(**kwargs))
        return "La herramienta no define run() correctamente."
    except Exception as e:
        return f"Error en ejecución: {e}"
