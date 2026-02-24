# Asistente Personal WhatsApp con IA

Bot de WhatsApp que imita tu estilo de escritura usando Groq, RAG con pgvector y un panel de administración en React.

## Requisitos

- Node.js 20+
- PostgreSQL 15+ con extensión [pgvector](https://github.com/pgvector/pgvector)
- (Opcional) Redis para cola de mensajes
- API key: [Groq](https://console.groq.com/) (para el LLM). Los embeddings son locales (Xenova/all-MiniLM-L6-v2), no se usa OpenAI.

## Desarrollo local

1. Clonar y entrar en el proyecto:
   ```bash
   cd WhatsAppAssistant
   ```

2. Base de datos con Docker:
   ```bash
   docker compose up -d postgres redis
   ```

3. Variables de entorno (copiar y editar):
   ```bash
   cp .env.example .env
   ```
   Definir al menos: `DATABASE_URL`, `GROQ_API_KEY`. Opcional: `REDIS_URL`.

4. Migraciones:
   ```bash
   cd backend
   npm install
   npm run migrate:up
   ```

5. Iniciar backend:
   ```bash
   npm run dev
   ```

6. En otra terminal, frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

7. Abrir http://localhost:5173, ir a Dashboard y pulsar "Conectar (QR)" para escanear el código con WhatsApp.

## Despliegue en VPS (Docker + Nginx)

1. En el servidor, clonar el repo y configurar `.env` (incluir `DATABASE_URL`, `GROQ_API_KEY`, `CORS_ORIGIN` con tu dominio).

2. Levantar solo infra si la DB está externa:
   ```bash
   docker compose up -d postgres redis
   ```
   O levantar todo:
   ```bash
   docker compose up -d
   ```

3. Ejecutar migraciones en el contenedor de la base o desde el host:
   ```bash
   cd backend && npm run migrate:up
   ```
   (Asegurar que `DATABASE_URL` esté disponible.)

4. Build del frontend y servir con Nginx:
   ```bash
   cd frontend && npm run build
   ```
   Copiar `frontend/dist` al servidor (ej. `/var/www/whatsapp-assistant/frontend`) y usar la configuración de ejemplo en `deploy/nginx.conf.example` (sustituir `YOUR_DOMAIN`).

5. HTTPS con Let's Encrypt:
   ```bash
   certbot --nginx -d tu-dominio.com
   ```

## Estructura

- `backend/`: Node.js + TypeScript, Express, whatsapp-web.js, Groq, embeddings locales (Transformers.js + all-MiniLM-L6-v2), pgvector, cola Bull (Redis) o en memoria.
- `frontend/`: React + Vite + Tailwind; proxy a `/api` en dev.
- `deploy/`: Ejemplo de configuración Nginx.

## API (resumen)

- `GET/POST /api/session` — Estado WhatsApp y QR.
- `GET/PATCH /api/chats` — Listar chats y actualizar reglas (respond_always, on_mention, keyword, never).
- `GET/PUT /api/style` — Configuración de estilo (tono, emojis, frases).
- `POST /api/import` — Subir .txt exportado de WhatsApp.
- `GET /api/imported` — Listar chats importados.
- `POST /api/analyze` — Análisis de conversación (body: importedChatId, query).
- `GET /api/logs` — Últimos mensajes.
- `POST /api/send` — Enviar mensaje manual (body: chatId, text).

## Consideraciones

- Uso de whatsapp-web.js no oficial; revisar términos de uso de WhatsApp.
- No commitear `.env`. Mantener secretos en el servidor.
- Límites de tasa de Groq: la cola y los reintentos ayudan a evitar bloqueos.
