"""Application logging setup."""

from __future__ import annotations

import logging
import os

from whatsapp_bot.infrastructure.config.settings import settings


def configure_logging() -> None:
    """Configure application logging handlers and formatters."""
    if settings.enable_logging:
        os.makedirs(os.path.dirname(settings.log_file) or ".", exist_ok=True)
        logging.basicConfig(
            level=logging.INFO,
            format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            handlers=[logging.FileHandler(settings.log_file), logging.StreamHandler()],
        )
    else:
        logging.basicConfig(level=logging.WARNING)
