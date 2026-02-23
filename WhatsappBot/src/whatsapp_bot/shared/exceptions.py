"""Shared exception types for WhatsAppBot."""

from __future__ import annotations


class ValidationError(ValueError):
    """Raised when input payload does not satisfy required schema."""
