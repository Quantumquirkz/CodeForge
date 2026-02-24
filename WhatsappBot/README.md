# 🤖 WhatsappBot - AI Assistant para WhatsApp

Un asistente de IA conversacional integrado con **Groq** que responde mensajes de WhatsApp en tiempo real, con soporte multiidioma y clasificación inteligente de mensajes.

**Estado**: Beta (lista para MVP en producción com Groq + Twilio)

---

## ✨ Features

- ✅ **Integración Groq AI** - Respuestas naturales con Llama 3.1 70B
- ✅ **Soporte Multiidioma** - Detecta automáticamente español, inglés, portugués
- ✅ **Clasificación de Contexto** - Detecta: saludos, despedidas, quejas, preguntas técnicas, generales
- ✅ **Rate Limiting** - 20 requests/minuto por usuario
- ✅ **Historial Contextual** - Hasta 10 intercambios por usuario en sesión
- ✅ **Webhooks Seguros** - Validación de firmas Twilio
- ✅ **Arquitectura Hexagonal** - Clean Code, fácil de extender
- 🔄 **Adapters**: Twilio + Meta (en desarrollo)
- 🚀 **Fallback LLM** - Modo limitado sin Groq

---

## 🚀 Setup Rápido

### Requisitos
- Python 3.9+
- pip o poetry
- Cuenta Groq (API key gratis en [groq.com](https://groq.com))
- Número Twilio o Meta WhatsApp Business Account

### 1. Instalar dependencias

```bash
# Clonar repo
git clone <repo-url>
cd WhatsappBot

# Crear venv (recomendado)
python -m venv venv
source venv/bin/activate  # o `venv\Scripts\activate` en Windows

# Instalar paquetes
pip install -r requirements.txt
```

### 2. Configurar variables de entorno

```bash
# Copiar template
cp .env.example .env

# Editar .env con tus valores
nano .env  # o VSCode
```

**Variables requeridas:**
```ini
# Groq (obtener en https://console.groq.com/keys)
GROQ_API_KEY=gsk_...

# Twilio (obtener en https://console.twilio.com)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_NUMBER=+1...
TWILIO_VERIFY_SIGNATURE=true

# Meta (opcional, para Cloud API)
META_ACCESS_TOKEN=...
META_PHONE_ID=...
```

### 3. Ejecutar servidor

```bash
# Modo desarrollo
python -m src.whatsapp_bot.app.bootstrap

# O directamente
python whatsapp_bot.py
```

Server escucha en `http://localhost:5000` por defecto.

---

## 📡 Endpoints API

### `POST /webhook`
Recibe webhooks de Twilio/Meta. Procesa mensaje y responde automáticamente.

**Twilio (form-data):**
```bash
curl -X POST http://localhost:5000/webhook \
  -d "From=whatsapp:+50199999999" \
  -d "Body=Hola bot" \
  -d "AccountSid=AC..." \
  -d "MessageSid=SM..."
```

**Meta (JSON):**
```bash
curl -X POST http://localhost:5000/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "entry": [{
      "changes": [{
        "value": {
          "messages": [{
            "from": "50199999999",
            "text": {"body": "Hola bot"}
          }]
        }
      }]
    }]
  }'
```

**Response:**
```json
{
  "status": "success",
  "response": "Hola! ¿Cómo puedo ayudarte?",
  "message_id": "msg_123..."
}
```

### `GET /health`
Health check del servidor.

```bash
curl http://localhost:5000/health
```

Response:
```json
{
  "status": "healthy",
  "uptime_seconds": 3600,
  "groq_available": true
}
```

### `GET /`
Info del servicio.

```bash
curl http://localhost:5000/
```

---

## 🏗️ Arquitectura Hexagonal

```
src/whatsapp_bot/
├── app/                  # FastAPI/Flask bootstrap
│   ├── bootstrap.py     # Factory de la app
│   └── api/
│       ├── routes.py    # Endpoints
│       └── schemas.py   # DTOs (validación)
│
├── domain/              # Lógica de negocio (sin deps)
│   ├── entities/        # Conversation, Message
│   ├── ports/           # Abstracciones (interfaces)
│   │   ├── llm_port.py         # Para Groq
│   │   └── messaging_port.py   # Para Twilio/Meta
│   └── services/        # Language detector, Message classifier
│
├── use_cases/           # Casos de uso (orquestación)
│   └── process_incoming_message.py
│
├── integrations/        # Implementaciones concretas
│   ├── ai/
│   │   ├── groq_client.py
│   │   └── fallback_client.py
│   └── messaging/
│       ├── twilio_adapter.py
│       └── meta_adapter.py
│
└── infrastructure/      # Detalles técnicos
    ├── config/
    │   └── settings.py
    ├── security/
    │   └── request_verifier.py
    └── storage/
        ├── in_memory_context_store.py
        └── in_memory_rate_limiter.py
```

**Patrones:**
- **Puertos**: Abstracciones (LLM, Messaging) ignoradas por pruebas mock
- **Adapters**: Implementaciones concretas (Groq, Twilio, Meta)
- **Use Cases**: Orquestación de flujos (entrada → clasificación → respuesta)
- **Entidades**: Objetos de dominio (Conversation, Message)

---

## 🧪 Tests

```bash
# Tests unitarios
pytest tests/unit/ -v

# Tests integración
pytest tests/integration/ -v

# Cobertura
pytest --cov=src tests/ --cov-report=html
```

**Cobertura actual**: ~70% (en mejora)

---

## 🔧 Configuración Avanzada

### Variables de Entorno

| Variable | Defecto | Descripción |
|----------|---------|-------------|
| `GROQ_API_KEY` | `""` | API key de Groq (requerido) |
| `GROQ_MODEL` | `llama-3.1-70b-versatile` | Modelo a usar |
| `GROQ_MAX_TOKENS` | `512` | Máximo tokens en respuesta |
| `GROQ_TEMPERATURE` | `0.7` | Creatividad (0-1) |
| `HOST` | `0.0.0.0` | IP servidor |
| `PORT` | `5000` | Puerto servidor |
| `LOG_LEVEL` | `INFO` | Nivel de logs |
| `TWILIO_VERIFY_SIGNATURE` | `true` | Validar firmas Twilio |
| `CONTEXT_MAX_MESSAGES` | `10` | Mensajes en histories |
| `RATE_LIMIT_REQUESTS` | `20` | Requests/minuto |

### Prompts Personalizados

Editar [src/whatsapp_bot/prompts/templates.py](src/whatsapp_bot/prompts/templates.py):

```python
GREETINGS_PROMPT = """
Eres un asistente amable y profesional...
[Tu prompt aquí]
"""
```

---

## 📋 Limitaciones Actuales

- ⚠️ Contexto en memoria (se pierde al reiniciar) → DB en desarrollo
- ⚠️ Geen multimedia (imágenes, audio) → En roadmap
- ⚠️ Fallback limitado → Ver P2 en mejoras
- ⚠️ Solo Twilio/Meta básico → Versión Cloud API en desarrollo

---

## 🤝 Contribuir

1. Fork el repo
2. Crea una rama: `git checkout -b feature/tu-feature`
3. Commit: `git commit -am "Add feature"`
4. Push: `git push origin feature/tu-feature`
5. PR con descripción detallada

### Mejoras Planeadas (Roadmap)
Ver [STRUCTURE.md](STRUCTURE.md#roadmap) para detalles de mejoras P0/P1/P2.

---

## 📞 Soporte

- **Documentación**: Ver [STRUCTURE.md](STRUCTURE.md)
- **Issues**: Crear en GitHub
- **Groq Docs**: https://console.groq.com/docs
- **Twilio Docs**: https://www.twilio.com/docs/whatsapp

---

## 📄 Licencia

MIT - Ver LICENSE

---

**Última actualización**: Febrero 2026 | Status: Beta MVP
