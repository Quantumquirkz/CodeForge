from langchain.tools import tool

from app.blockchain.service import blockchain_service
from app.core.config import settings


@tool
def control_lights(room: str, state: str) -> str:
    """Controls the lights in a specific room. state can be 'on' or 'off'."""
    return f"The lights in the {room} are now {state}. Is there anything else I can help you with?"


@tool
def send_email(recipient: str, subject: str, body: str) -> str:
    """Sends an email to a recipient with a subject and body."""
    return f"Email sent to {recipient} with subject: {subject}. I've taken care of that for you."


@tool
def get_wallet_balance(address: str) -> str:
    """Returns blockchain wallet balance for an EVM address (Ethereum-compatible)."""
    result = blockchain_service.get_balance(address)
    return (
        f"Wallet {result.address} on {result.network} has {result.balance_eth} ETH "
        f"({result.balance_wei} wei)."
    )


@tool
def prepare_crypto_transfer(to_address: str, amount_eth: str) -> str:
    """Prepares a transfer plan. Execution requires explicit confirmation."""
    transfer = blockchain_service.simulate_transfer(to_address, amount_eth)
    return (
        "Transfer prepared in simulation mode. "
        f"Recipient: {transfer.to_address}, Amount: {transfer.amount_eth} ETH, Status: {transfer.status}."
    )


def get_tools() -> list:
    tools = [control_lights, send_email, get_wallet_balance, prepare_crypto_transfer]
    if not settings.BLOCKCHAIN_ENABLED:
        return tools
    return tools
