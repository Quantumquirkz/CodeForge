"""Application entrypoint (compatibility wrapper)."""

from __future__ import annotations

import sys
from pathlib import Path

SRC_PATH = Path(__file__).resolve().parent / "src"
if str(SRC_PATH) not in sys.path:
    sys.path.insert(0, str(SRC_PATH))

from whatsapp_bot.app.bootstrap import create_app
from whatsapp_bot.infrastructure.config.settings import settings

app = create_app()


def main() -> None:
    """Run development server."""
    app.run(host="0.0.0.0", port=settings.port, debug=False)


if __name__ == "__main__":
    main()
