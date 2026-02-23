import pytest
from pydantic import ValidationError

from app.models.chat import ChatInboundMessage


def test_chat_inbound_message_rejects_empty_text() -> None:
    with pytest.raises(ValidationError):
        ChatInboundMessage(text="")


def test_chat_inbound_message_accepts_valid_text() -> None:
    model = ChatInboundMessage(text="Hello Veronica")

    assert model.text == "Hello Veronica"
