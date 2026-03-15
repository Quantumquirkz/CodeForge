# ADR 0003: Plugin Generation and Approval

## Status

Accepted.

## Context

Veronica debe poder auto-extenderse generando nuevas herramientas. Se requiere generación de código, ejecución segura y aprobación humana.

## Decision

- **Generación**: CodeAgent (subgrafo) con LLM genera código Python siguiendo interfaz `def run(**kwargs) -> str`.
- **Sandbox**: ejecución con `__builtins__` restringido; whitelist de funciones seguras.
- **Aprobación**: nuevas herramientas requieren confirmación humana vía API `/api/plugins/approve`.
- **Registry**: PluginRegistry en memoria + persistencia en disco (`plugins/`).
- **Audit**: eventos tool_generation_request y plugin_approval en JSONL.

## Consequences

- Capacidad de auto-extensión controlada.
- Riesgo mitigado por sandbox y aprobación.
- Límites configurables: max_tools_per_session, max_plugin_executions.
