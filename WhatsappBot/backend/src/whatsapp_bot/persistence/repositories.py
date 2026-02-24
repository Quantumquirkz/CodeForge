from __future__ import annotations

from dataclasses import asdict, dataclass

from sqlalchemy import desc

from whatsapp_bot.app.api.schemas import BotConfigDTO, PersonaProfileDTO, WritingSampleCreateDTO
from whatsapp_bot.persistence.db import get_session
from whatsapp_bot.persistence.models import BotConfig, ConfigAuditLog, PersonaProfile, PersonaStyleGuide, WritingSample


@dataclass
class StyleGuideSnapshot:
    guide_text: str
    signals: dict
    sample_count: int


class BotRepository:
    def _get_or_create_singleton(self, model, defaults: dict):
        session = get_session()
        entity = session.get(model, 1)
        if entity is None:
            entity = model(id=1, **defaults)
            session.add(entity)
            session.commit()
            session.refresh(entity)
        return session, entity

    def get_config(self) -> BotConfigDTO:
        session, entity = self._get_or_create_singleton(
            BotConfig,
            {
                "bot_name": "Asistente Virtual",
                "default_language": "es",
                "temperature": 0.7,
                "max_tokens": 500,
                "context_enabled": True,
                "context_memory_size": 10,
                "response_length_policy": "balanced",
                "emoji_policy": "moderate",
            },
        )
        dto = BotConfigDTO(
            bot_name=entity.bot_name,
            default_language=entity.default_language,
            temperature=entity.temperature,
            max_tokens=entity.max_tokens,
            context_enabled=entity.context_enabled,
            context_memory_size=entity.context_memory_size,
            response_length_policy=entity.response_length_policy,
            emoji_policy=entity.emoji_policy,
        )
        session.close()
        return dto

    def update_config(self, dto: BotConfigDTO) -> BotConfigDTO:
        session, entity = self._get_or_create_singleton(BotConfig, {})
        for key, value in dto.model_dump().items():
            setattr(entity, key, value)
        session.add(ConfigAuditLog(event_type="config.updated", payload=dto.model_dump()))
        session.commit()
        session.close()
        return dto

    def get_persona(self) -> PersonaProfileDTO:
        session, entity = self._get_or_create_singleton(
            PersonaProfile,
            {
                "tone": "friendly",
                "formality": 5,
                "humor_level": 3,
                "brevity_level": 6,
                "signature_phrases": [],
                "forbidden_phrases": [],
                "writing_rules": [],
            },
        )
        dto = PersonaProfileDTO(
            tone=entity.tone,
            formality=entity.formality,
            humor_level=entity.humor_level,
            brevity_level=entity.brevity_level,
            signature_phrases=entity.signature_phrases,
            forbidden_phrases=entity.forbidden_phrases,
            writing_rules=entity.writing_rules,
        )
        session.close()
        return dto

    def update_persona(self, dto: PersonaProfileDTO) -> PersonaProfileDTO:
        session, entity = self._get_or_create_singleton(PersonaProfile, {})
        for key, value in dto.model_dump().items():
            setattr(entity, key, value)
        session.add(ConfigAuditLog(event_type="persona.updated", payload=dto.model_dump()))
        session.commit()
        session.close()
        return dto

    def list_samples(self) -> list[dict]:
        session = get_session()
        rows = session.query(WritingSample).order_by(desc(WritingSample.id)).all()
        payload = [
            {
                "id": row.id,
                "source": row.source,
                "content": row.content,
                "language": row.language,
                "tags": row.tags,
                "created_at": row.created_at.isoformat() if row.created_at else "",
            }
            for row in rows
        ]
        session.close()
        return payload

    def add_sample(self, dto: WritingSampleCreateDTO) -> dict:
        session = get_session()
        row = WritingSample(
            source=dto.source,
            content=dto.content,
            language=dto.language,
            tags=dto.tags,
        )
        session.add(row)
        session.flush()
        session.add(
            ConfigAuditLog(
                event_type="sample.created",
                payload={"id": row.id, **dto.model_dump()},
            )
        )
        session.commit()
        session.refresh(row)
        payload = {
            "id": row.id,
            "source": row.source,
            "content": row.content,
            "language": row.language,
            "tags": row.tags,
            "created_at": row.created_at.isoformat() if row.created_at else "",
        }
        session.close()
        return payload

    def delete_sample(self, sample_id: int) -> bool:
        session = get_session()
        row = session.get(WritingSample, sample_id)
        if row is None:
            session.close()
            return False
        session.delete(row)
        session.add(ConfigAuditLog(event_type="sample.deleted", payload={"id": sample_id}))
        session.commit()
        session.close()
        return True

    def get_style_guide(self) -> StyleGuideSnapshot:
        session, row = self._get_or_create_singleton(
            PersonaStyleGuide,
            {"guide_text": "Mantener tono amistoso y claro.", "signals": {}, "sample_count": 0},
        )
        snapshot = StyleGuideSnapshot(
            guide_text=row.guide_text,
            signals=row.signals or {},
            sample_count=row.sample_count,
        )
        session.close()
        return snapshot

    def update_style_guide(self, snapshot: StyleGuideSnapshot) -> StyleGuideSnapshot:
        session, row = self._get_or_create_singleton(PersonaStyleGuide, {})
        row.guide_text = snapshot.guide_text
        row.signals = snapshot.signals
        row.sample_count = snapshot.sample_count
        session.add(
            ConfigAuditLog(
                event_type="style_guide.rebuilt",
                payload={"sample_count": snapshot.sample_count, "signals": snapshot.signals},
            )
        )
        session.commit()
        session.close()
        return snapshot

    def recent_audit(self, limit: int = 20) -> list[dict]:
        session = get_session()
        rows = session.query(ConfigAuditLog).order_by(desc(ConfigAuditLog.id)).limit(limit).all()
        out = [
            {
                "event_type": row.event_type,
                "payload": row.payload,
                "created_at": row.created_at.isoformat() if row.created_at else "",
            }
            for row in rows
        ]
        session.close()
        return out
