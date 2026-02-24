"""Application factory and wiring."""

from __future__ import annotations

from flask import Flask
from flask_cors import CORS

from whatsapp_bot.app.api.routes.admin import build_admin_blueprint
from whatsapp_bot.app.api.routes.system import build_system_blueprint
from whatsapp_bot.app.api.routes.webhook import build_webhook_blueprint
from whatsapp_bot.core.settings import settings
from whatsapp_bot.integrations.groq_client import GroqClient, NullGroqClient
from whatsapp_bot.persistence.db import init_engine, init_session_factory
from whatsapp_bot.persistence.repositories import BotRepository
from whatsapp_bot.persistence.schema import ensure_schema
from whatsapp_bot.runtime.process_incoming_message import ProcessIncomingMessage
from whatsapp_bot.security.rate_limit import InMemoryRateLimiter


def create_app() -> Flask:
    app = Flask(__name__)
    app.config["PORT"] = settings.port
    app.config["DEBUG"] = settings.debug

    init_engine(settings.database_url)
    init_session_factory()
    if settings.auto_create_schema:
        ensure_schema()

    CORS(
        app,
        resources={r"/api/v1/admin/*": {"origins": settings.admin_allowed_origins}},
        supports_credentials=False,
    )

    repository = BotRepository()
    try:
        llm_client = GroqClient()
    except ValueError:
        llm_client = NullGroqClient()

    process_use_case = ProcessIncomingMessage(
        repository=repository,
        llm_client=llm_client,
        style_ttl_seconds=20,
    )

    admin_limiter = InMemoryRateLimiter(
        max_requests=settings.admin_rate_limit_messages,
        window_seconds=settings.rate_limit_window,
    )

    app.register_blueprint(build_webhook_blueprint(process_use_case))
    app.register_blueprint(build_admin_blueprint(repository, admin_limiter))
    app.register_blueprint(build_system_blueprint(repository))

    @app.after_request
    def apply_security_headers(response):
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "no-referrer"
        response.headers["Cache-Control"] = "no-store"
        return response

    return app
