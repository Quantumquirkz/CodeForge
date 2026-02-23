"""Application bootstrap and dependency wiring."""

from __future__ import annotations

from flask import Flask

from whatsapp_bot.app.api.routes import build_api_blueprint
from whatsapp_bot.infrastructure.logging.logger import configure_logging
from whatsapp_bot.integrations.ai.fallback_client import FallbackLLMClient
from whatsapp_bot.integrations.ai.groq_client import GroqClient
from whatsapp_bot.use_cases.process_incoming_message import ProcessIncomingMessage


def create_app() -> Flask:
    """Create and configure the Flask application instance."""
    configure_logging()

    app = Flask(__name__)
    try:
        llm_client = GroqClient()
    except ValueError as exc:
        llm_client = FallbackLLMClient(reason=str(exc))

    message_use_case = ProcessIncomingMessage(llm_client=llm_client)
    app.register_blueprint(build_api_blueprint(message_use_case))
    return app
