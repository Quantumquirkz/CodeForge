from __future__ import annotations


class PromptBuilder:
    @staticmethod
    def build(system_base: str, persona_style_guide: str, message_context: str) -> str:
        return (
            f"{system_base}\n\n"
            f"GUIA DE PERSONALIDAD Y ESTILO:\n{persona_style_guide}\n\n"
            f"CONTEXTO:\n{message_context}\n\n"
            "Reglas: responde en el idioma del usuario, manteniendo consistencia con la guia."
        )
