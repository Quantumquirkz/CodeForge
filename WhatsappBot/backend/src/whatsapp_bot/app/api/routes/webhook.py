from __future__ import annotations

from flask import Blueprint, Response, jsonify, request
from twilio.request_validator import RequestValidator
from twilio.twiml.messaging_response import MessagingResponse

from whatsapp_bot.core.settings import settings
from whatsapp_bot.integrations.messaging import MetaAdapter, TwilioAdapter
from whatsapp_bot.runtime.process_incoming_message import ProcessIncomingMessage


def build_webhook_blueprint(process_use_case: ProcessIncomingMessage) -> Blueprint:
    bp = Blueprint("webhook", __name__, url_prefix="/api/v1/webhook")

    @bp.post("/incoming")
    def incoming():
        payload = request.get_json(silent=True) or {}
        form_data = request.form.to_dict()

        is_twilio = bool(form_data.get("From"))
        if is_twilio and settings.verify_twilio_signature:
            auth_token = settings.twilio_auth_token.strip()
            if not auth_token:
                return jsonify({"status": "error", "message": "Twilio auth token is not configured"}), 503

            signature = request.headers.get("X-Twilio-Signature", "")
            validator = RequestValidator(auth_token)
            if not signature or not validator.validate(request.url, form_data, signature):
                return jsonify({"status": "error", "message": "Invalid Twilio signature"}), 403

        try:
            if is_twilio:
                sender, message = TwilioAdapter.normalize(payload, form_data)
            else:
                sender, message = MetaAdapter.normalize(payload, form_data)
        except (KeyError, ValueError):
            return jsonify({"status": "error", "message": "Invalid message format"}), 400

        if not message.strip():
            return jsonify({"status": "error", "message": "Message must not be empty"}), 400

        response_text = process_use_case.execute(user_id=sender.strip() or "unknown", message=message.strip())

        if is_twilio:
            twiml = MessagingResponse()
            twiml.message(response_text)
            return Response(str(twiml), mimetype="application/xml")

        return jsonify({"status": "success", "response": response_text})

    # Legacy compatibility endpoints.
    @bp.record_once
    def _legacy_routes(state):
        app = state.app

        @app.post("/webhook")
        def legacy_webhook():
            return incoming()

        @app.get("/health")
        def legacy_health():
            return jsonify({"status": "healthy", "service": "whatsapp-bot-v2"})

        @app.get("/")
        def legacy_index():
            return jsonify(
                {
                    "message": "WhatsApp Bot API",
                    "webhook": "/api/v1/webhook/incoming",
                    "admin": "/api/v1/admin",
                    "system": "/api/v1/system",
                }
            )

    return bp
