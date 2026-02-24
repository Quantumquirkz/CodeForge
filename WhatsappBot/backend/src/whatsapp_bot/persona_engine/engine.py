from __future__ import annotations

import re
from collections import Counter

from whatsapp_bot.app.api.schemas import PersonaProfileDTO
from whatsapp_bot.core.settings import settings
from whatsapp_bot.persistence.repositories import StyleGuideSnapshot


class PersonaEngine:
    def normalize_samples(self, samples: list[dict]) -> list[str]:
        seen = set()
        normalized: list[str] = []
        for sample in samples[: settings.persona_max_samples]:
            content = (sample.get("content", "") or "").strip()
            content = re.sub(r"\s+", " ", content)
            if not content:
                continue
            clip = content[:700]
            if clip.lower() in seen:
                continue
            seen.add(clip.lower())
            normalized.append(clip)
        return normalized

    def extract_signals(self, lines: list[str]) -> dict:
        if not lines:
            return {"avg_len": 0, "emoji_rate": 0, "question_rate": 0, "top_phrases": []}

        avg_len = int(sum(len(x) for x in lines) / len(lines))
        emoji_rate = round(sum(1 for x in lines if re.search(r"[\U0001F300-\U0001FAFF]", x)) / len(lines), 2)
        question_rate = round(sum(1 for x in lines if "?" in x or "\u00BF" in x) / len(lines), 2)

        words = []
        for line in lines:
            parts = re.findall(r"[A-Za-z\u00C0-\u017F]{4,}", line.lower())
            words.extend(parts)
        top_phrases = [w for w, _ in Counter(words).most_common(8)]

        return {
            "avg_len": avg_len,
            "emoji_rate": emoji_rate,
            "question_rate": question_rate,
            "top_phrases": top_phrases,
        }

    def build_style_guide(self, persona: PersonaProfileDTO, signals: dict) -> str:
        rules = [
            f"Tono objetivo: {persona.tone}.",
            f"Formalidad (1-10): {persona.formality}.",
            f"Humor (1-10): {persona.humor_level}.",
            f"Brevedad (1-10, mayor=mas breve): {persona.brevity_level}.",
            f"Longitud promedio observada: {signals.get('avg_len', 0)} caracteres.",
            f"Uso de emojis observado: {signals.get('emoji_rate', 0)}.",
            f"Uso de preguntas observado: {signals.get('question_rate', 0)}.",
        ]
        if persona.signature_phrases:
            rules.append("Incluir ocasionalmente estas frases: " + ", ".join(persona.signature_phrases[:10]))
        if persona.forbidden_phrases:
            rules.append("No usar estas frases: " + ", ".join(persona.forbidden_phrases[:10]))
        if persona.writing_rules:
            rules.append("Reglas de escritura: " + " | ".join(persona.writing_rules[:20]))
        if signals.get("top_phrases"):
            rules.append("Vocabulario frecuente detectado: " + ", ".join(signals["top_phrases"][:8]))

        text = "\n".join(rules)
        return text[: settings.persona_style_max_chars]

    def rebuild(self, persona: PersonaProfileDTO, samples: list[dict]) -> StyleGuideSnapshot:
        lines = self.normalize_samples(samples)
        signals = self.extract_signals(lines)
        guide = self.build_style_guide(persona, signals)
        return StyleGuideSnapshot(guide_text=guide, signals=signals, sample_count=len(lines))
