# Diseño de estructura de carpetas — WhatsAppBot

Este documento define una **propuesta inicial de arquitectura de carpetas** para pasar de un MVP monolítico (archivos en raíz) a un proyecto modular, mantenible y escalable.

## 1) Estructura actual (as-is)

```text
WhatsappBot/
├── whatsapp_bot.py
├── message_handler.py
├── groq_client.py
├── bot_instructions.py
├── config.py
├── example_usage.py
├── start.sh
├── requirements.txt
├── .env.example
└── README.md
```

### Limitaciones actuales

- Mezcla de capas (API + negocio + integración externa).
- Dificulta pruebas aisladas.
- Crecimiento riesgoso cuando aumenten proveedores o flujos.

---

## 2) Estructura propuesta (to-be)

```text
WhatsappBot/
├── src/
│   └── whatsapp_bot/
│       ├── app/
│       │   ├── api/
│       │   │   ├── routes.py               # Endpoints HTTP
│       │   │   └── schemas.py              # DTOs/request-response
│       │   └── bootstrap.py                # App factory / dependency wiring
│       ├── domain/
│       │   ├── entities/
│       │   │   ├── message.py
│       │   │   └── conversation.py
│       │   ├── services/
│       │   │   ├── language_detector.py
│       │   │   ├── message_classifier.py
│       │   │   └── context_manager.py
│       │   └── ports/
│       │       ├── llm_port.py             # Contrato para proveedor LLM
│       │       └── messaging_port.py       # Contrato para proveedor WA
│       ├── use_cases/
│       │   └── process_incoming_message.py
│       ├── integrations/
│       │   ├── ai/
│       │   │   └── groq_client.py
│       │   └── messaging/
│       │       ├── twilio_adapter.py
│       │       └── meta_adapter.py
│       ├── prompts/
│       │   ├── system.py
│       │   └── templates.py
│       ├── infrastructure/
│       │   ├── config/
│       │   │   ├── settings.py
│       │   │   └── env.py
│       │   ├── logging/
│       │   │   └── logger.py
│       │   └── storage/
│       │       └── in_memory_context_store.py
│       └── shared/
│           ├── exceptions.py
│           └── types.py
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── scripts/
│   ├── run_local.sh
│   └── smoke_test.sh
├── docs/
│   ├── architecture.md
│   ├── decisions/
│   └── runbooks/
├── logs/
├── sessions/
├── requirements.txt
├── .env.example
└── README.md
```

---

## 3) Criterios de diseño

- **Separación por capas**: dominio aislado de frameworks y SDKs.
- **Principio de inversión de dependencias**: el caso de uso depende de puertos (interfaces), no de Groq/Twilio directamente.
- **Facilidad de pruebas**: mocks de puertos y adaptadores en integración.
- **Evolución segura**: migración incremental sin “big-bang rewrite”.

---

## 4) Plan de migración por fases

### Fase 1 — Empaquetado inicial

- Crear `src/whatsapp_bot`.
- Mover `config.py` a `infrastructure/config/settings.py`.
- Mantener `whatsapp_bot.py` como wrapper temporal.

### Fase 2 — Extraer dominio y casos de uso

- Mover clasificación, idioma y contexto a `domain/services`.
- Crear `use_cases/process_incoming_message.py`.

### Fase 3 — Integraciones desacopladas

- Mover Groq a `integrations/ai/groq_client.py` implementando `llm_port.py`.
- Encapsular Twilio/Meta en `integrations/messaging`.

### Fase 4 — QA y operación

- Agregar pruebas unitarias + integración.
- Añadir scripts de smoke test.
- Documentar runbook de despliegue.

---

## 5) Convenciones sugeridas

- Imports absolutos desde `whatsapp_bot`.
- Tipado en funciones públicas.
- Validación de inputs en borde (API/adapters).
- Logs estructurados (JSON opcional en prod).
- Sin lógica de negocio en rutas HTTP.

---

## 6) Resultado esperado

Con esta estructura, WhatsAppBot queda listo para:

- agregar más proveedores de IA,
- soportar más canales de mensajería,
- facilitar mantenimiento por equipos,
- mejorar calidad mediante pruebas automatizadas.
