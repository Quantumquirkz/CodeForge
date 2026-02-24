from __future__ import annotations

import hmac

from flask import Blueprint, jsonify, request
from pydantic import ValidationError

from whatsapp_bot.app.api.schemas import BotConfigDTO, PersonaProfileDTO, RebuildResponseDTO, WritingSampleCreateDTO
from whatsapp_bot.core.settings import settings
from whatsapp_bot.persona_engine import PersonaEngine
from whatsapp_bot.persistence.repositories import BotRepository
from whatsapp_bot.security.rate_limit import InMemoryRateLimiter


def build_admin_blueprint(repository: BotRepository, limiter: InMemoryRateLimiter) -> Blueprint:
    bp = Blueprint("admin", __name__, url_prefix="/api/v1/admin")
    engine = PersonaEngine()

    def _extract_token() -> str:
        auth_header = request.headers.get("Authorization", "").strip()
        if auth_header.lower().startswith("bearer "):
            return auth_header[7:].strip()
        return request.headers.get("X-Admin-Token", "").strip()

    @bp.before_request
    def guard_admin_requests():
        if request.method not in {"GET", "PUT", "POST", "DELETE", "OPTIONS"}:
            return jsonify({"status": "error", "message": "Method not allowed"}), 405

        if request.method == "OPTIONS":
            return None

        key = request.remote_addr or "unknown"
        if not limiter.allow(key):
            return jsonify({"status": "error", "message": "Admin rate limit exceeded"}), 429

        if settings.admin_unsafe_no_auth:
            return None

        expected_token = settings.admin_api_token.strip()
        if not expected_token:
            return jsonify({"status": "error", "message": "Admin auth is not configured"}), 503

        provided_token = _extract_token()
        if not provided_token or not hmac.compare_digest(provided_token, expected_token):
            return jsonify({"status": "error", "message": "Unauthorized"}), 401

    @bp.get("/config")
    def get_config():
        return jsonify(repository.get_config().model_dump())

    @bp.put("/config")
    def put_config():
        try:
            dto = BotConfigDTO(**(request.get_json(silent=True) or {}))
        except ValidationError as exc:
            return jsonify({"status": "error", "message": exc.errors()}), 400
        return jsonify(repository.update_config(dto).model_dump())

    @bp.get("/persona")
    def get_persona():
        return jsonify(repository.get_persona().model_dump())

    @bp.put("/persona")
    def put_persona():
        try:
            dto = PersonaProfileDTO(**(request.get_json(silent=True) or {}))
        except ValidationError as exc:
            return jsonify({"status": "error", "message": exc.errors()}), 400
        return jsonify(repository.update_persona(dto).model_dump())

    @bp.get("/samples")
    def list_samples():
        return jsonify({"items": repository.list_samples()})

    @bp.post("/samples")
    def create_sample():
        try:
            dto = WritingSampleCreateDTO(**(request.get_json(silent=True) or {}))
        except ValidationError as exc:
            return jsonify({"status": "error", "message": exc.errors()}), 400
        item = repository.add_sample(dto)
        return jsonify(item), 201

    @bp.delete("/samples/<int:sample_id>")
    def remove_sample(sample_id: int):
        if not repository.delete_sample(sample_id):
            return jsonify({"status": "error", "message": "sample not found"}), 404
        return jsonify({"status": "success"})

    @bp.post("/persona/rebuild-style")
    def rebuild_style():
        persona = repository.get_persona()
        samples = repository.list_samples()
        snapshot = engine.rebuild(persona=persona, samples=samples)
        repository.update_style_guide(snapshot)
        response = RebuildResponseDTO(
            style_preview=snapshot.guide_text,
            sample_count=snapshot.sample_count,
            signals=snapshot.signals,
        )
        return jsonify(response.model_dump())

    @bp.get("/persona/style-preview")
    def style_preview():
        snap = repository.get_style_guide()
        response = RebuildResponseDTO(
            style_preview=snap.guide_text,
            sample_count=snap.sample_count,
            signals=snap.signals,
        )
        return jsonify(response.model_dump())

    return bp
