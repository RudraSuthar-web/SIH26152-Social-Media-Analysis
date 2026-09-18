from datetime import datetime, timezone
from sqlalchemy import String, Integer, Float, Boolean, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base

class AdapterHealthModel(Base):
    __tablename__ = "adapter_health"

    platform: Mapped[str] = mapped_column(String(32), primary_key=True)
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    healthy: Mapped[bool] = mapped_column(Boolean, default=True)
    status: Mapped[str] = mapped_column(String(16), default="healthy")
    lag_seconds: Mapped[float] = mapped_column(Float, default=0.8)
    rate_limit_usage_pct: Mapped[int] = mapped_column(Integer, default=34)
    events_ingested_24h: Mapped[int] = mapped_column(Integer, default=0)
    last_success_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    error_count: Mapped[int] = mapped_column(Integer, default=0)

class ModelHealthModel(Base):
    __tablename__ = "model_health"

    model_name: Mapped[str] = mapped_column(String(64), primary_key=True)
    version: Mapped[str] = mapped_column(String(32), nullable=False)
    p95_latency_ms: Mapped[float] = mapped_column(Float, default=18.4)
    p99_latency_ms: Mapped[float] = mapped_column(Float, default=32.1)
    error_rate_pct: Mapped[float] = mapped_column(Float, default=0.02)
    total_inferences: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(16), default="optimal")

class DeadLetterEventModel(Base):
    __tablename__ = "dead_letter_events"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    platform: Mapped[str] = mapped_column(String(32), nullable=False)
    error_code: Mapped[str] = mapped_column(String(64), nullable=False)
    error_message: Mapped[str] = mapped_column(Text, nullable=False)
    received_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    retry_count: Mapped[int] = mapped_column(Integer, default=0)
    raw_payload_snippet: Mapped[str] = mapped_column(Text, nullable=False)
