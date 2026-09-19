import pytest
from datetime import datetime, timezone
from app.adapters.x_adapter import XAdapter
from app.adapters.telegram_adapter import TelegramAdapter
from app.adapters.registry import registry

@pytest.mark.asyncio
async def test_x_adapter_fetch():
    adapter = XAdapter({"provider": "synthetic"})
    now = datetime.now(timezone.utc)
    events = [e async for e in adapter.fetch_events(since=now, until=now)]
    assert len(events) > 0
    assert events[0].platform == "x"

@pytest.mark.asyncio
async def test_telegram_adapter_fetch():
    adapter = TelegramAdapter({"allow_synthetic": True})
    now = datetime.now(timezone.utc)
    events = [e async for e in adapter.fetch_events(since=now, until=now)]
    assert len(events) > 0
    assert events[0].platform == "telegram"

def test_registry():
    assert "x" in registry.list_adapters()
    assert "telegram" in registry.list_adapters()
