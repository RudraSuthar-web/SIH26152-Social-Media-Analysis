import math
from datetime import datetime, timezone
from app.analytics.trends.metrics import compute_trend_metrics, TopicStats

def test_compute_trend_metrics_formula():
    now = datetime.now(timezone.utc)
    current = TopicStats(volume=24890, window_start=now, peak_at=now, growth_rate=3.42)
    previous = TopicStats(volume=5632, window_start=now, peak_at=now, growth_rate=1.20)
    
    metrics = compute_trend_metrics(current, previous, half_life_hours=6.0)
    
    assert metrics["volume"] == 24890
    assert abs(metrics["components"]["volume_score"] - math.log(24891)) < 1e-4
    assert metrics["trend_score"] > 0
    assert "decay" in metrics["components"]

def test_compute_trend_metrics_no_previous():
    now = datetime.now(timezone.utc)
    current = TopicStats(volume=100, window_start=now, peak_at=now)
    
    metrics = compute_trend_metrics(current, None)
    
    assert metrics["volume"] == 100
    assert metrics["trend_score"] > 0
