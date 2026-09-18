from typing import Literal, Optional
from pydantic import BaseModel

class AdapterHealth(BaseModel):
    platform: str
    enabled: bool = True
    healthy: bool = True
    status: Literal["healthy", "degraded", "down"] = "healthy"
    lag_seconds: float = 0.8
    rate_limit_usage_pct: int = 34
    events_ingested_24h: int = 89400
    last_success_at: str
    error_count: int = 0

class ModelHealth(BaseModel):
    model_name: str
    version: str
    p95_latency_ms: float
    p99_latency_ms: float
    error_rate_pct: float
    total_inferences: int
    status: Literal["optimal", "degraded", "offline"] = "optimal"

class DeadLetterEntry(BaseModel):
    id: str
    platform: str
    error_code: str
    error_message: str
    received_at: str
    retry_count: int
    raw_payload_snippet: str

class OverviewMetrics(BaseModel):
    total_events_24h: int
    events_trend_pct: float
    active_accounts_24h: int
    trending_topics_count: int
    sentiment_distribution: dict[str, float]
    adapter_health: dict[str, str]

class ModelEvaluationData(BaseModel):
    model_name: str
    version: str
    macro_f1: float
    precision: float
    recall: float
    latency_p95_ms: float
    latency_p99_ms: float
    drift_detected: bool
    languages_eval: dict[str, dict[str, float]]
