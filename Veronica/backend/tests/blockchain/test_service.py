from app.blockchain.service import BlockchainService


def test_get_balance_returns_zero_when_blockchain_disabled() -> None:
    service = BlockchainService(network="ethereum", rpc_url=None, enabled=False)

    result = service.get_balance("0x0000000000000000000000000000000000000001")

    assert result.balance_eth == "0"
    assert result.balance_wei == "0"


def test_simulate_transfer_validates_amount_and_address() -> None:
    service = BlockchainService(network="ethereum", rpc_url=None, enabled=False)

    result = service.simulate_transfer(
        to_address="0x0000000000000000000000000000000000000002",
        amount_eth="0.75",
    )

    assert result.status == "simulated"
    assert result.amount_eth == "0.75"


def test_simulate_transfer_rejects_invalid_amount() -> None:
    service = BlockchainService(network="ethereum", rpc_url=None, enabled=False)

    try:
        service.simulate_transfer(
            to_address="0x0000000000000000000000000000000000000002",
            amount_eth="-1",
        )
    except ValueError as exc:
        assert "greater than zero" in str(exc)
    else:
        raise AssertionError("Expected ValueError for invalid amount")
