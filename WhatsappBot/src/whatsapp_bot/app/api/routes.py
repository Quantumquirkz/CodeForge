"""HTTP routes for WhatsAppBot."""

from __future__ import annotations

import logging

from flask import Blueprint, jsonify, request
from twilio.twiml.messaging_response import MessagingResponse

from whatsapp_bot.app.api.schemas import build_incoming_dto
from whatsapp_bot.infrastructure.config.settings import settings
from whatsapp_bot.infrastructure.security.request_verifier import TwilioRequestVerifier
from whatsapp_bot.infrastructure.storage.in_memory_rate_limiter import InMemoryRateLimiter
from whatsapp_bot.integrations.messaging.meta_adapter import MetaAdapter
from whatsapp_bot.integrations.messaging.twilio_adapter import TwilioAdapter
from whatsapp_bot.shared.exceptions import ValidationError
from whatsapp_bot.use_cases.process_incoming_message import ProcessIncomingMessage

logger = logging.getLogger(__name__)


def build_api_blueprint(
    process_message_uc: ProcessIncomingMessage,
    rate_limiter: InMemoryRateLimiter | None = None,
    twilio_verifier: TwilioRequestVerifier | None = None,
) -> Blueprint:
    """Create API blueprint wired with use cases and infra guards."""
    bp = Blueprint("api", __name__)

    limiter = rate_limiter
    if limiter is None and settings.rate_limit_enabled:
        limiter = InMemoryRateLimiter(
            max_requests=settings.rate_limit_messages,
            window_seconds=settings.rate_limit_window,
        )

    verifier = twilio_verifier
    if verifier is None and settings.verify_twilio_signature and settings.twilio_auth_token:
        verifier = TwilioRequestVerifier(auth_token=settings.twilio_auth_token)

    @bp.route("/webhook", methods=["POST"])
    def webhook():
        try:
            payload = request.get_json(silent=True) or {}
            form_data = request.form.to_dict()

            is_twilio_form = bool(form_data.get("From"))
            adapter = TwilioAdapter if is_twilio_form else MetaAdapter
            sender, incoming_message = adapter.normalize_incoming_payload(payload, form_data)

            incoming_dto = build_incoming_dto(sender=sender, message=incoming_message)

            if is_twilio_form and verifier is not None:
                signature = request.headers.get("X-Twilio-Signature")
                if not verifier.is_valid(request.url, form_data, signature):
                    return jsonify({"status": "error", "message": "Invalid Twilio signature"}), 403

            if limiter is not None and not limiter.allow(incoming_dto.sender):
                return jsonify({"status": "error", "message": "Rate limit exceeded"}), 429

            response_text = process_message_uc.execute(
                user_id=incoming_dto.sender,
                message=incoming_dto.message,
            )

            if is_twilio_form:
                resp = MessagingResponse()
                resp.message(response_text)
                return str(resp)

            return jsonify({"status": "success", "response": response_text})
        except ValidationError as exc:
            return jsonify({"status": "error", "message": str(exc)}), 400
        except Exception as exc:  # noqa: BLE001
            logger.exception("Error in webhook: %s", exc)
            return jsonify({"status": "error", "message": str(exc)}), 500

    @bp.route("/health", methods=["GET"])
    def health_check():
        return jsonify({"status": "healthy", "service": "WhatsApp Bot", "ai_provider": "Groq"})

    @bp.route("/", methods=["GET"])
    def index():
        return jsonify(
            {
                "message": "WhatsApp Bot with Groq AI",
                "endpoints": {"webhook": "/webhook (POST)", "health": "/health (GET)"},
            }
        )

    return bp
