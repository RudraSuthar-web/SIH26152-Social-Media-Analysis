import pytest
from app.ingestion.pipeline import pipeline
from app.ingestion.validator import EventValidator
from app.ingestion.normalizer import EventNormalizer
from app.adapters.base import RawPlatformEvent
from datetime import datetime, timezone

def test_event_normalizer_pseudonymization():
    raw = RawPlatformEvent(
        platform="x",
        source_event_id="e-1",
        source_user_id="@JohnDoe",
        text="Test event for NTRO platform",
        event_timestamp=datetime.now(timezone.utc)
    )
    normalized = EventNormalizer.normalize(raw)
    assert normalized["node_id"].startswith("node_")
    assert normalized["node_id"] != "@JohnDoe"

@pytest.mark.asyncio
async def test_pipeline_job():
    res = await pipeline.run_ingestion_job(platform="x", lookback_minutes=60)
    assert res["processed_count"] > 0
    assert res["platform"] == "x"
