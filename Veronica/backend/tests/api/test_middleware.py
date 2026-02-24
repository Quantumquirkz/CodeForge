from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.api.middleware import RequestContextLoggingMiddleware


def test_logging_middleware_sets_request_id_header() -> None:
    app = FastAPI()
    app.add_middleware(RequestContextLoggingMiddleware)

    @app.get("/ok")
    async def ok() -> dict[str, str]:
        return {"status": "ok"}

    client = TestClient(app)
    response = client.get("/ok")

    assert response.status_code == 200
    assert "x-request-id" in response.headers


def test_logging_middleware_handles_unexpected_errors() -> None:
    app = FastAPI()
    app.add_middleware(RequestContextLoggingMiddleware)

    @app.get("/boom")
    async def boom() -> dict[str, str]:
        raise RuntimeError("boom")

    client = TestClient(app)
    response = client.get("/boom")

    assert response.status_code == 500
    payload = response.json()
    assert payload["detail"] == "Internal server error"
    assert "request_id" in payload
