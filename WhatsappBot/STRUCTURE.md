# 🏗️ Estructura del Proyecto - WhatsappBot

Documentación técnica detallada de la arquitectura, patrones, y flujos de datos.

---

## 📂 Organización de Directorios

```
WhatsappBot/
├── src/whatsapp_bot/              # Implementación principal
│   ├── __init__.py
│   ├── app/                          # Capa de aplicación (Flask/API)
│   │   ├── __init__.py
│   │   ├── bootstrap.py              # Factory de aplicación Flask
│   │   └── api/
│   │       ├── __init__.py
│   │       ├── routes.py             # Endpoints HTTP
│   │       └── schemas.py            # DTOs (Pydantic) para validación
│   │
│   ├── domain/                       # Lógica de negocio (aislada)
│   │   ├── __init__.py
│   │   ├── entities/                 # Objetos de dominio
│   │   │   ├── __init__.py
│   │   │   ├── conversation.py      # Historial de chat por usuario
│   │   │   └── message.py           # Mensaje individual
│   │   │
│   │   ├── ports/                    # Abstracciones (INTERFACES)
│   │   │   ├── __init__.py
│   │   │   ├── llm_port.py          # Define contrato LLM (Groq, fallback, etc)
│   │   │   └── messaging_port.py    # Define contrato Messaging (Twilio, Meta)
│   │   │
│   │   └── services/                 # Servicios de dominio
│   │       ├── __init__.py
│   │       ├── language_detector.py  # Detecta idioma del mensaje
│   │       └── message_classifier.py # Clasifica tipo de mensaje
│   │
│   ├── use_cases/                    # Casos de uso (orquestación)
│   │   ├── __init__.py
│   │   └── process_incoming_message.py  # Flujo principal: mensaje → respuesta
│   │
│   ├── integrations/                 # Implementaciones concretas
│   │   ├── __init__.py
│   │   ├── ai/                       # Clientes LLM
│   │   │   ├── __init__.py
│   │   │   ├── groq_client.py       # ✅ Implementación Groq
│   │   │   └── fallback_client.py   # Fallback cuando no hay Groq
│   │   │
│   │   └── messaging/                # Adapters de mensajería
│   │       ├── __init__.py
│   │       ├── twilio_adapter.py    # Normaliza Twilio payload
│   │       └── meta_adapter.py      # 🔄 Normaliza Meta payload (en desarrollo)
│   │
│   ├── infrastructure/               # Detalles técnicos
│   │   ├── __init__.py
│   │   ├── config/
│   │   │   ├── __init__.py
│   │   │   └── settings.py          # Cargas variables .env
│   │   │
│   │   ├── logging/
│   │   │   ├── __init__.py
│   │   │   └── logger.py            # Configuración de logs
│   │   │
│   │   ├── security/
│   │   │   ├── __init__.py
│   │   │   └── request_verifier.py  # Valida firmas Twilio
│   │   │
│   │   └── storage/                  # Almacenamiento (en memoria, DB en futuro)
│   │       ├── __init__.py
│   │       ├── in_memory_context_store.py  # Historial conversación
│   │       └── in_memory_rate_limiter.py   # Rate limiting por usuario
│   │
│   ├── prompts/
│   │   ├── __init__.py
│   │   └── templates.py             # Prompts para Groq por contexto/idioma
│   │
│   └── shared/
│       ├── __init__.py
│       └── exceptions.py            # Excepciones personalizadas
│
├── tests/                            # Suite de tests
│   ├── __init__.py
│   ├── unit/                         # Tests unitarios
│   │   ├── __init__.py
│   │   ├── test_domain_services.py  # Language detector, classifier
│   │   ├── test_security_and_rate_limit.py
│   │   ├── test_use_case_process_incoming_message.py
│   │   └── test_api_schemas_and_adapters.py
│   │
│   └── integration/                  # Tests de integración
│       ├── __init__.py
│       └── test_api_routes.py       # Tests end-to-end de endpoints
│
├── .env.example                      # Plantilla de configuración
├── .gitignore                        # Git ignore
├── requirements.txt                  # Dependencias pip
├── pytest.ini                        # Config pytest
├── README.md                         # 📖 User guide
├── STRUCTURE.md                      # 📖 Este archivo
├── whatsapp_bot.py                   # Wrapper raíz (compatibilidad)
├── config.py                         # Wrapper raíz (compatibilidad)
├── groq_client.py                    # Wrapper raíz (compatibilidad)
└── start.sh                          # Script start para Linux
```

---

## 🔄 Flujo de Datos (Happy Path)

```
User sends WhatsApp message
    ↓
Webhook POST /webhook
    ↓
API Schema validates & extracts:
  - from (número usuario)
  - message text
  - timestamp
    ↓
TwilioAdapter.normalize() / MetaAdapter.normalize()
    ↓
ProcessIncomingMessage use case ORQUESTA:
    ├─ LanguageDetector.detect(text)
    │   └→ Retorna idioma: "es" | "en" | "pt"
    │
    ├─ MessageClassifier.classify(text, language)
    │   └→ Retorna tipo: greeting | farewell | complaint | technical | question | general
    │
    ├─ InMemoryContextStore.get(user_id)
    │   └→ Retorna historial previo (max 10 mensajes)
    │
    ├─ PromptTemplate construye prompt contextual
    │   └→ "Eres un asistente en español. Usuario dijo: ... Historial: ..."
    │
    └─ GroqClient.generate(prompt)
        └→ LLama 3.1 70B genera respuesta
    
Response stored → sent back to user
    ↓
Added to conversation history
```

---

## 🏛️ Arquitectura Hexagonal (Clean Code)

**Principio**: Lógica de negocio (`domain/`) está **aislada** de detalles técnicos.

### Capas

```
┌─────────────────────────────────────────────────────┐
│        USE CASES (Orquestación)                     │
│     ProcessIncomingMessage                          │
└─────────────┬───────────────────────────────────────┘
              │
┌─────────────┴───────────────────────────────────────┐
│  DOMAIN (Lógica pura, sin dependencias)             │
│  ├─ Services (detect language, classify)           │
│  ├─ Entities (Conversation, Message)               │
│  └─ Ports (LLMPort, MessagingPort) = INTERFACES    │
└─────────────┬───────────────────────────────────────┘
              │
┌─────────────┴───────────────────────────────────────┐
│ INTEGRATIONS (Implementaciones concretas)           │
│ ├─ GroqClient (implementa LLMPort)                 │
│ ├─ FallbackClient (implementa LLMPort)             │
│ ├─ TwilioAdapter (implementa MessagingPort)        │
│ └─ MetaAdapter (implementa MessagingPort)          │
└─────────────┬───────────────────────────────────────┘
              │
┌─────────────┴───────────────────────────────────────┐
│ INFRASTRUCTURE (Detalles técnicos)                  │
│ ├─ Config (settings.py desde .env)                 │
│ ├─ Security (validación firmas)                    │
│ └─ Storage (context, rate limiting)                │
└─────────────┬───────────────────────────────────────┘
              │
┌─────────────┴───────────────────────────────────────┐
│        APP (Flask / API HTTP)                       │
│  ├─ routes.py (endpoints)                          │
│  ├─ schemas.py (validation DTOs)                   │
│  └─ bootstrap.py (factory)                         │
└─────────────────────────────────────────────────────┘
```

### Patrones Usados

| Patrón | Ubicación | Propósito |
|--------|-----------|----------|
| **Ports & Adapters** | `domain/ports/` + `integrations/` | Desacoplar LLM y Messaging |
| **Use Cases** | `use_cases/` | Orquestación de flujos de negocio |
| **Strategy Pattern** | LanguageDetector, MessageClassifier | Diferentes estrategias por idioma |
| **Dependency Injection** | Constructores de clases | Inyectar puertos (mocks en tests) |
| **Data Transfer Objects** | `app/api/schemas.py` | Validar payloads HTTP |
| **Service Layer** | `domain/services/` | Lógica específica de dominio |

---

## 🔌 Puertos (Abstracciones)

### `domain/ports/llm_port.py`

Define el contrato para cualquier cliente LLM:

```python
class LLMPort(ABC):
    @abstractmethod
    def generate(
        self,
        prompt: str,
        conversation_history: List[Message],
        language: str,
    ) -> str:
        """Genera respuesta con contexto."""
        pass
```

**Implementaciones:**
- ✅ `GroqClient` (producción)
- 🟡 `FallbackClient` (fallback simple)

---

### `domain/ports/messaging_port.py`

Define el contrato para normalizar mensajes:

```python
class MessagingPort(ABC):
    @abstractmethod
    def parse_incoming(self, payload: dict) -> Message:
        """Normaliza payload a objeto Message."""
        pass

    @abstractmethod
    def prepare_outgoing(self, user_id: str, text: str) -> dict:
        """Prepara respuesta para enviar."""
        pass
```

**Implementaciones:**
- ✅ `TwilioAdapter` (form-data)
- 🟡 `MetaAdapter` (JSON básico, necesita fix)

---

## 📝 Flujo Detallado: POST /webhook

### 1️⃣ Validación HTTP (app/api/routes.py)

```python
@app.route('/webhook', methods=['POST'])
def webhook():
    # Validar content-type
    if request.is_json:
        adapter = MetaAdapter()
        payload = request.json
    else:
        adapter = TwilioAdapter()
        payload = request.form.to_dict()
    
    # Validar firma Twilio (opcional)
    if settings.TWILIO_VERIFY_SIGNATURE:
        verifier.verify(request)
```

### 2️⃣ Normalización (Adapters)

```python
# TwilioAdapter.normalize(request.form)
message = Message(
    from_number="whatsapp:+50199999999",
    text="Hola bot",
    timestamp=datetime.now()
)

# MetaAdapter.normalize(request.json)
# 🔄 ACTUALMENTE INCOMPLETO - FIX PLANEADO
```

### 3️⃣ Orquestación (ProcessIncomingMessage)

```python
use_case = ProcessIncomingMessage(
    language_detector=detector,
    message_classifier=classifier,
    context_store=store,
    llm_client=groq_client
)

response = use_case.execute(message)
```

### 4️⃣ Rate Limiting

```python
limiter.check_limit(user_id)  # Raises si > 20/min
context_store.add_message(user_id, message)
```

### 5️⃣ Respuesta

```python
return jsonify({
    "status": "success",
    "response": response,
    "message_id": message.id
})
```

---

## 🧪 Testing Strategy

### Unit Tests
- **Objetivo**: Probar lógica aislada sin dependencias
- **Ubicación**: `tests/unit/`
- **Uso de Mocks**: SÍ (inyectar mocks en constructores)
- **Ejemplos**:
  ```python
  def test_language_detector_spanish():
      detector = LanguageDetector()
      assert detector.detect("Hola mundo") == "es"
  
  def test_message_classifier_greeting():
      clf = MessageClassifier()
      assert clf.classify("Buenos días", "es") == "greeting"
  ```

### Integration Tests
- **Objetivo**: Probar endpoints HTTP y flujos completos
- **Ubicación**: `tests/integration/`
- **Uso de Fixtures**: Groq mocked, pero flujo real
- **Ejemplos**:
  ```python
  def test_webhook_twilio_success(test_client):
      response = test_client.post(
          '/webhook',
          data={"From": "whatsapp:...", "Body": "Hola"}
      )
      assert response.status_code == 200
  ```

### Cobertura
- **Actual**: ~70%
- **Objetivo**: 80%+ crítico para P0
- **Comando**: `pytest --cov=src tests/`

---

## ⚙️ Configuración (settings.py)

```python
class Settings(BaseSettings):
    # Groq
    GROQ_API_KEY: str  # Requerido
    GROQ_MODEL: str = "llama-3.1-70b-versatile"
    GROQ_MAX_TOKENS: int = 512
    GROQ_TEMPERATURE: float = 0.7

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 5000
    DEBUG: bool = False

    # Security
    TWILIO_VERIFY_SIGNATURE: bool = True
    TWILIO_AUTH_TOKEN: str = ""

    # Storage
    CONTEXT_MAX_MESSAGES: int = 10
    CONTEXT_TTL_MINUTES: int = 60

    # Rate Limiting
    RATE_LIMIT_REQUESTS: int = 20
    RATE_LIMIT_WINDOW_SECONDS: int = 60

    class Config:
        env_file = ".env"
        case_sensitive = True
```

Cargar: `settings = Settings()` (auto-lee .env)

---

## 🚨 Manejo de Errores

### Errores Personalizados (shared/exceptions.py)

```python
class WhatsappBotException(Exception):
    """Base exception."""
    pass

class InvalidMessageFormat(WhatsappBotException):
    """Payload inválido."""
    pass

class RateLimitExceeded(WhatsappBotException):
    """Usuario superó rate limit."""
    pass

class LLMException(WhatsappBotException):
    """Groq falló."""
    pass
```

### Manejo en Routes

```python
@app.errorhandler(RateLimitExceeded)
def handle_rate_limit(error):
    return jsonify({"error": "Rate limit exceeded"}), 429

@app.errorhandler(LLMException)
def handle_llm_error(error):
    return jsonify({"error": "AI service unavailable"}), 503
```

---

## 📊 Roadmap de Mejoras

### 🔴 **P0 - Crítico (Bloquea producción)**

- [ ] **Documentación** ✅ README + STRUCTURE (EN PROGRESO)
- [ ] **Fix MetaAdapter** - Soportar formato Cloud API real
- [ ] **Error Handling** - Excepciones específicas, no genéricas
- [ ] **Tests P0** - Expandir cobertura a 75% mínimo

**Tiempo estimado**: 2 semanas

---

### 🟠 **P1 - Alto (MVP necesita)**

- [ ] **Persistencia DB** - PostgreSQL con SQLAlchemy
  - Reemplazar `InMemoryContextStore`
  - Guardar conversaciones históricamente
  
- [ ] **Envío de Mensajes** - Bidireccional
  - Implementar `OutgoingMessagePort`
  - SDK Twilio para envío proactivo
  
- [ ] **Multimedia** - Imágenes, audio, documentos
  - Detectar tipo en payload
  - Descripción contextual con Groq
  
- [ ] **Language Detection** - Real
  - Cambiar a `langdetect` o `textblob`
  - Soportar 50+ idiomas
  
- [ ] **Logging Estructurado** - JSON
  - Implementar con `python-json-logger`
  - Agregar correlation IDs

**Tiempo estimado**: 3-4 semanas

---

### 🟡 **P2 - Medio (Nice-to-have futuro)**

- [ ] **Clasificación NLP** - Entrenar modelo real
- [ ] **Rate Limiting Persistente** - Redis en lugar de memoria
- [ ] **Docker + CI/CD** - GitHub Actions
- [ ] **Analytics** - Dashboard de conversaciones
- [ ] **Fallback Real** - OpenAI o Ollama
- [ ] **Historial Largo** - Summarization automática
- [ ] **Autenticación** - OAuth2 para usuarios
- [ ] **Kubernetes** - Deploy escalable

**Tiempo estimado**: 6-8 semanas

---

## 🔍 Debugging

### Logs

```bash
# Verbose (desarrollo)
LOG_LEVEL=DEBUG python whatsapp_bot.py

# Mostrar logs en tiempo real
tail -f logs/app.log
```

### Testing Local

```bash
# Con Groq mock
pytest tests/unit/ -v

# Con servidor levantado
python whatsapp_bot.py &
curl -X POST http://localhost:5000/webhook ...
```

### Inspeccionar Payloads

Editar [routes.py](src/whatsapp_bot/app/api/routes.py) agregar:

```python
import json
logger.debug(f"Raw payload: {json.dumps(payload, indent=2)}")
```

---

## 📚 Referencias

- **Groq API**: https://console.groq.com/docs
- **Twilio WhatsApp**: https://www.twilio.com/docs/whatsapp
- **Meta Cloud API**: https://developers.facebook.com/docs/whatsapp/cloud-api/
- **Clean Architecture**: https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html
- **Hexagonal Architecture**: https://alistair.cockburn.us/hexagonal-architecture/

---

**Última actualización**: Febrero 2026 | Status: Documentación P0 en progreso
