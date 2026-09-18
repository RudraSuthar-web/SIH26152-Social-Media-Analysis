import math
from datetime import datetime, timezone
from dataclasses import dataclass
from app.schemas.trends import TrendMetrics

@dataclass
class TopicStats:
    volume: int
    window_start: datetime
    peak_at: datetime
    growth_rate: float = 0.0

def compute_trend_metrics(
    current: TopicStats,
    previous: TopicStats | None = None,
    half_life_hours: float = 6.0
) -> dict:
    """
    SOUL.md §10 & BACKEND_IMPLEMENTATION.md Trend Score Formula:
    
    volume_score = log(volume + 1)
    growth_rate = (current.volume - previous.volume) / max(previous.volume, 1) if previous else 0
    velocity = growth_rate - previous.growth_rate if previous else 0
    decay = exp(-ln(2) * hours_since_peak / half_life_hours)
    
    trend_score = volume_score * (1 + growth_rate) * (1 + velocity) * decay
    """
    volume = current.volume
    volume_score = math.log(volume + 1)
    
    if previous and previous.volume > 0:
        growth_rate = (volume - previous.volume) / previous.volume
    else:
        growth_rate = current.growth_rate
    
    if previous:
        velocity = growth_rate - previous.growth_rate
    else:
        velocity = 0.2
    
    now_utc = datetime.now(timezone.utc)
    hours_since_peak = max((now_utc - current.peak_at.replace(tzinfo=timezone.utc if current.peak_at.tzinfo is None else current.peak_at.tzinfo)).total_seconds() / 3600.0, 0.0)
    decay = math.exp(-math.log(2) * hours_since_peak / half_life_hours)
    
    trend_score = volume_score * (1 + max(growth_rate, -0.99)) * (1 + velocity) * decay
    
    return {
        "volume": volume,
        "growth_rate": growth_rate,
        "velocity": velocity,
        "momentum": growth_rate * decay,
        "trend_score": trend_score,
        "components": {
            "volume_score": volume_score,
            "growth_rate": growth_rate,
            "velocity": velocity,
            "decay": decay
        }
    }
