# WhatsAppBot con Groq AI

Bot de WhatsApp orientado a uso **profesional** para automatizar atención conversacional con IA (Groq), integrable vía webhook (Twilio/WhatsApp Business API) y preparado para evolucionar hacia una arquitectura más modular.

## Estado del proyecto

Actualmente el proyecto funciona con una estructura plana (archivos Python en la raíz de `WhatsappBot/`) y un servidor Flask con endpoint de webhook.

En esta iteración se dejó documentado:

- cómo está organizado hoy,
- hacia dónde conviene evolucionarlo,
- una propuesta de estructura de carpetas por fases para mejorar mantenibilidad y escalabilidad.

---

## Características actuales

- Integración con Groq para generación de respuestas.
- Clasificación de intención básica (saludo, pregunta, soporte, queja, despedida).
- Detección simple de idioma (es/en/pt).
- Contexto conversacional en memoria por usuario.
- Webhook HTTP con Flask (`/webhook`) y endpoint de salud (`/health`).

---

## Arquitectura actual (resumen)

```text
WhatsappBot/
├── whatsapp_bot.py       # API Flask + webhook
├── message_handler.py    # Lógica de procesamiento
├── groq_client.py        # Integración con Groq
├── bot_instructions.py   # Prompts
├── config.py             # Variables de entorno y constantes
├── example_usage.py      # Script de ejemplo
└── start.sh              # Script de arranque
```

Esta base es útil para un MVP, pero mezcla responsabilidades de transporte, dominio y proveedores externos en una sola capa.

---

## Estructura objetivo (diseño inicial)

Se propone migrar progresivamente a una estructura por capas:

```text
WhatsappBot/
├── src/
│   └── whatsapp_bot/
│       ├── app/                     # Entrypoints (Flask/FastAPI), wiring
│       ├── domain/                  # Entidades y lógica de negocio pura
│       ├── services/                # Casos de uso / orquestación
│       ├── integrations/            # Groq, Twilio, WhatsApp providers
│       ├── prompts/                 # Plantillas de prompts
│       ├── infrastructure/          # Config, logging, almacenamiento
│       └── shared/                  # Utilidades comunes
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── scripts/
├── docs/
├── .env.example
├── requirements.txt
└── README.md
```

Beneficios esperados:

- Separación clara de responsabilidades.
- Mayor testabilidad (unitaria e integración).
- Menor acoplamiento entre lógica del bot y proveedores externos.
- Camino limpio hacia despliegue en contenedores y observabilidad.

> Revisión detallada en `STRUCTURE.md`.

---

## Instalación rápida

```bash
git clone https://github.com/Jhuomar-Barria/Code-Forge.git
cd Code-Forge/WhatsappBot
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Configura al menos:

```env
GROQ_API_KEY=tu_api_key
```

---

## Ejecución

### Desarrollo local

```bash
python whatsapp_bot.py
```

Servidor disponible en:

- `GET /` información básica
- `GET /health` estado del servicio
- `POST /webhook` recepción de mensajes

### Script de inicio

```bash
bash start.sh
```

---

## Variables de entorno principales

- `GROQ_API_KEY` (requerida)
- `GROQ_MODEL` (default: `llama-3.1-70b-versatile`)
- `GROQ_MAX_TOKENS`
- `GROQ_TEMPERATURE`
- `ENABLE_CONTEXT`
- `CONTEXT_MEMORY_SIZE`
- `PORT`

Opcionales para Twilio:

- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_WHATSAPP_NUMBER`

---

## Plan de evolución recomendado (siguiente paso)

1. Crear paquete `src/whatsapp_bot` sin romper ejecución actual.
2. Mover `config` y `logging` a `infrastructure/`.
3. Mover `groq_client` a `integrations/ai/`.
4. Separar clasificación/detección/contexto en `domain/` y `services/`.
5. Añadir pruebas unitarias para clasificación y detección de idioma.
6. Añadir pruebas de integración para webhook.

---

## Seguridad y operación

- No subir `.env` al repositorio.
- Usar HTTPS en webhooks en producción.
- Agregar validación de firma del proveedor (Twilio/Meta).
- Implementar rate limiting y trazabilidad por request ID.

---

## Recursos

- [Groq Docs](https://console.groq.com/docs)
- [Twilio WhatsApp API](https://www.twilio.com/docs/whatsapp)
- [WhatsApp Business Platform](https://developers.facebook.com/docs/whatsapp)
