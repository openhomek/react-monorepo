import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def client() -> TestClient:
    from app.main import app

    return TestClient(app)


def test_health_returns_ok(client: TestClient) -> None:
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {"data": {"status": "ok"}}


def test_health_allows_dev_origin(client: TestClient) -> None:
    response = client.get("/api/health", headers={"Origin": "http://localhost:5175"})

    assert response.headers["access-control-allow-origin"] == "http://localhost:5175"
    assert response.headers["access-control-allow-credentials"] == "true"
