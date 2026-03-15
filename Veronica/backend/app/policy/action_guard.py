"""Action guard: detects sensitive actions and requires confirmation."""

from typing import Any


def evaluate(text: str) -> dict[str, Any]:
    """Evaluate user text for action intent. Returns pending_action if confirmation needed."""
    text_lower = text.lower()
    sensitive = ["encender luces", "apagar luces", "enviar email", "transferir", "crypto"]
    for keyword in sensitive:
        if keyword in text_lower:
            return {"requires_confirmation": True, "action_type": keyword}
    return {"requires_confirmation": False}
