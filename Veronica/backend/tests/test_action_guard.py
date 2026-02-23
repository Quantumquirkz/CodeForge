from app.policy.action_guard import ActionGuard


def test_action_guard_flags_lights_command_for_confirmation() -> None:
    guard = ActionGuard()

    result = guard.evaluate("Please turn on the lights in the kitchen")

    assert result.requires_confirmation is True
    assert result.pending_action is not None
    assert result.pending_action.action_type == "control_lights"
    assert result.pending_action.arguments["room"].lower() == "kitchen"
    assert result.pending_action.arguments["state"] == "on"


def test_action_guard_flags_crypto_transfer_for_confirmation() -> None:
    guard = ActionGuard()

    result = guard.evaluate(
        "Transfer 0.25 ETH to 0x0000000000000000000000000000000000000003"
    )

    assert result.requires_confirmation is True
    assert result.pending_action is not None
    assert result.pending_action.action_type == "prepare_crypto_transfer"
    assert result.pending_action.arguments["amount_eth"] == "0.25"


def test_action_guard_ignores_non_action_message() -> None:
    guard = ActionGuard()

    result = guard.evaluate("Tell me a joke")

    assert result.requires_confirmation is False
    assert result.pending_action is None
