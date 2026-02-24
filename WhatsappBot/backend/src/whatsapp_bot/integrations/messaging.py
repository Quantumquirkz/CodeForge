from __future__ import annotations


class TwilioAdapter:
    @staticmethod
    def normalize(payload: dict, form_data: dict) -> tuple[str, str]:
        sender = form_data.get("From", "") or payload.get("from", "")
        message = form_data.get("Body", "") or payload.get("message", "")
        return sender, message


class MetaAdapter:
    @staticmethod
    def normalize(payload: dict, form_data: dict) -> tuple[str, str]:
        _ = form_data
        if payload.get("from") and payload.get("message"):
            return payload["from"], payload["message"]
        if payload.get("from") and payload.get("text", {}).get("body"):
            return payload["from"], payload["text"]["body"]
        entry = payload.get("entry", [])
        if not entry:
            raise ValueError("Invalid Meta payload")
        msg = entry[0]["changes"][0]["value"]["messages"][0]
        return msg.get("from", ""), msg.get("text", {}).get("body", "")
