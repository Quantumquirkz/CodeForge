from __future__ import annotations

from flask import Blueprint, jsonify

from whatsapp_bot.core.settings import settings
from whatsapp_bot.persistence.repositories import BotRepository


def build_system_blueprint(repository: BotRepository) -> Blueprint:
    bp = Blueprint("system", __name__, url_prefix="/api/v1/system")

    @bp.get("/health")
    def health():
        return jsonify({"status": "healthy", "service": "whatsapp-bot-v2"})

    @bp.get("/security")
    def security():
        return jsonify(
            {
                "admin_unsafe_no_auth": settings.admin_unsafe_no_auth,
                "admin_public_risk": settings.admin_public_risk,
                "admin_api_token_configured": bool(settings.admin_api_token.strip()),
                "verify_twilio_signature": settings.verify_twilio_signature,
                "twilio_auth_token_configured": bool(settings.twilio_auth_token.strip()),
                "allowed_origins": settings.admin_allowed_origins,
                "admin_rate_limit_messages": settings.admin_rate_limit_messages,
            }
        )

    @bp.get("/audit")
    def audit():
        return jsonify({"items": repository.recent_audit(limit=50)})

    return bp
