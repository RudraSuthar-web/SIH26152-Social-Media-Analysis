import pytest
import httpx
from app.main import app

@pytest.mark.asyncio
async def test_contract_api_envelopes():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as ac:
        endpoints = [
            "/api/v1/events",
            "/api/v1/sentiment/timeline",
            "/api/v1/sentiment/emotions",
            "/api/v1/sentiment/confidence-histogram",
            "/api/v1/sentiment/sarcasm-scatter",
            "/api/v1/sentiment/language-heatmap",
            "/api/v1/trends",
            "/api/v1/network/graph",
            "/api/v1/network/kol",
            "/api/v1/network/communities",
            "/api/v1/demographics",
            "/api/v1/admin/ingestion/status"
        ]

        for ep in endpoints:
            res = await ac.get(ep)
            assert res.status_code == 200, f"Endpoint {ep} failed with status {res.status_code}"
            json_body = res.json()
            assert "data" in json_body, f"Endpoint {ep} missing 'data' key"
            assert "meta" in json_body, f"Endpoint {ep} missing 'meta' key"
            assert "data_source" in json_body["meta"], f"Endpoint {ep} meta missing 'data_source'"

@pytest.mark.asyncio
async def test_admin_ingestion_trigger():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as ac:
        payload = {"platform": "x", "lookback_minutes": 30}
        res = await ac.post("/api/v1/admin/ingestion/trigger", json=payload)
        assert res.status_code == 200
        data = res.json()["data"]
        assert "job_id" in data
        assert data["status"] == "completed"
        assert data["processed_count"] > 0
