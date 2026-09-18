from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert "version" in response.json()

def test_events_endpoint_envelope():
    response = client.get("/api/v1/events")
    assert response.status_code == 200
    json_data = response.json()
    assert "data" in json_data
    assert "meta" in json_data
    assert "request_id" in json_data["meta"]
    assert "x-request-id" in response.headers

def test_overview_metrics_endpoint():
    response = client.get("/api/v1/metrics/overview")
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["data"]["total_events_24h"] == 148290

def test_trend_formula_endpoint():
    response = client.get("/api/v1/trends/t-101/formula")
    assert response.status_code == 200
    json_data = response.json()
    assert "formula_str" in json_data["data"]
