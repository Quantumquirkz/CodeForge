"""Blockchain service primitives for Veronica Agent.

The initial implementation supports:
- read-only wallet balance via JSON-RPC (`eth_getBalance`)
- simulated transfer execution (safe default)

Write-paths that require signing should be delegated to a secure wallet signer or
custody provider in production.
"""

from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal, InvalidOperation
from typing import Any

import httpx

from app.core.config import settings


WEI_PER_ETH = Decimal("1000000000000000000")


@dataclass(slots=True)
class BalanceResult:
    """Normalized balance response."""

    address: str
    network: str
    balance_wei: str
    balance_eth: str


@dataclass(slots=True)
class TransferResult:
    """Result of a blockchain transfer request."""

    to_address: str
    amount_eth: str
    status: str
    transaction_hash: str | None = None


class BlockchainService:
    """Access layer for blockchain network calls with secure defaults."""

    def __init__(self, network: str, rpc_url: str | None, enabled: bool) -> None:
        self.network = network
        self.rpc_url = rpc_url
        self.enabled = enabled

    @staticmethod
    def _validate_hex_address(address: str) -> str:
        normalized = address.strip()
        if not normalized.startswith("0x") or len(normalized) != 42:
            raise ValueError("Invalid EVM address format. Expected 0x-prefixed 42-char string.")
        return normalized

    def get_balance(self, address: str) -> BalanceResult:
        """Return wallet balance using JSON-RPC eth_getBalance."""
        normalized_address = self._validate_hex_address(address)

        if not self.enabled or not self.rpc_url:
            return BalanceResult(
                address=normalized_address,
                network=self.network,
                balance_wei="0",
                balance_eth="0",
            )

        payload: dict[str, Any] = {
            "jsonrpc": "2.0",
            "method": "eth_getBalance",
            "params": [normalized_address, "latest"],
            "id": 1,
        }

        response = httpx.post(self.rpc_url, json=payload, timeout=15.0)
        response.raise_for_status()

        data = response.json()
        if "error" in data:
            raise ValueError(f"RPC error: {data['error']}")

        balance_hex = data.get("result", "0x0")
        balance_wei = int(balance_hex, 16)
        balance_eth = Decimal(balance_wei) / WEI_PER_ETH

        return BalanceResult(
            address=normalized_address,
            network=self.network,
            balance_wei=str(balance_wei),
            balance_eth=f"{balance_eth.normalize()}",
        )

    def simulate_transfer(self, to_address: str, amount_eth: str) -> TransferResult:
        """Prepare a safe simulation of transfer execution.

        This method intentionally does not sign/send transactions. It provides a
        deterministic execution artifact so the orchestration layer can enforce a
        confirmation and, later, invoke secure signer infrastructure.
        """
        normalized_to = self._validate_hex_address(to_address)
        try:
            amount = Decimal(amount_eth)
        except InvalidOperation as exc:
            raise ValueError("Invalid transfer amount. Expected decimal number.") from exc

        if amount <= 0:
            raise ValueError("Transfer amount must be greater than zero.")

        return TransferResult(
            to_address=normalized_to,
            amount_eth=str(amount.normalize()),
            status="simulated",
            transaction_hash=None,
        )


blockchain_service = BlockchainService(
    network=settings.BLOCKCHAIN_NETWORK,
    rpc_url=settings.BLOCKCHAIN_RPC_URL,
    enabled=settings.BLOCKCHAIN_ENABLED,
)
