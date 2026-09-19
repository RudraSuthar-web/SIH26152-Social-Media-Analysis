import pytest
import httpx
from app.main import app

@pytest.mark.asyncio
async def test_root_endpoint():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/")
    assert response.status_code == 200
    assert "version" in response.json()

@pytest.mark.asyncio
async def test_events_endpoint_envelope():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/v1/events")
    assert response.status_code == 200
    json_data = response.json()
    assert "data" in json_data
    assert "meta" in json_data
    assert "request_id" in json_data["meta"]

@pytest.mark.asyncio
async def test_overview_metrics_endpoint():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/v1/metrics/overview")
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["data"]["total_events_24h"] > 0

@pytest.mark.asyncio
async def test_trend_formula_endpoint():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/v1/trends/t-101/formula")
    assert response.status_code == 200
    json_data = response.json()
    assert "formula_str" in json_data["data"]
