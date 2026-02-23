from app.memory.session_store import SessionStore
from app.policy.action_guard import ActionGuard, PendingAction
from app.policy.confirmation import handle_confirmation_command


def test_handle_confirmation_command_confirm(monkeypatch) -> None:
    test_store = SessionStore()
    pending_action = PendingAction(
        action_id="abc-123",
        action_type="control_lights",
        arguments={"room": "office", "state": "on"},
        preview_message="Turn on the lights in the office",
    )
    test_store.set_pending_action("session-1", pending_action)

    guard = ActionGuard()

    def fake_execute(action: PendingAction) -> str:
        return f"executed:{action.action_type}"

    monkeypatch.setattr(guard, "execute", fake_execute)

    handled, response = handle_confirmation_command(
        "session-1",
        "confirm abc-123",
        session_store=test_store,
        action_guard=guard,
    )

    assert handled is True
    assert response == "executed:control_lights"
    assert test_store.get_pending_action("session-1") is None


def test_handle_confirmation_command_cancel() -> None:
    test_store = SessionStore()
    pending_action = PendingAction(
        action_id="abc-999",
        action_type="send_email",
        arguments={"recipient": "x@example.com", "subject": "hi", "body": "hello"},
        preview_message="Send email",
    )
    test_store.set_pending_action("session-2", pending_action)

    handled, response = handle_confirmation_command(
        "session-2",
        "cancel abc-999",
        session_store=test_store,
        action_guard=ActionGuard(),
    )

    assert handled is True
    assert "cancelled" in response.lower()
    assert test_store.get_pending_action("session-2") is None
