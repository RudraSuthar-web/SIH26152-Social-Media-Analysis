import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Text, Float, Boolean, DateTime, JSON, Integer
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base

class CanonicalEventModel(Base):
    __tablename__ = "canonical_events"

    event_id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: f"evt-{uuid.uuid4().hex[:8]}")
    platform: Mapped[str] = mapped_column(String(32), nullable=False)
    source_event_id: Mapped[str] = mapped_column(String(128), nullable=False)
    source_user_id: Mapped[str] = mapped_column(String(128), nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    language: Mapped[str] = mapped_column(String(16), default="en")
    detected_language_confidence: Mapped[float] = mapped_column(Float, default=0.95)
    translated_text: Mapped[str] = mapped_column(Text, nullable=True)
    event_timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    ingested_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    conversation_id: Mapped[str] = mapped_column(String(128), nullable=True)
    parent_event_id: Mapped[str] = mapped_column(String(128), nullable=True)
    mentions: Mapped[dict] = mapped_column(JSON, default=list)
    hashtags: Mapped[dict] = mapped_column(JSON, default=list)
    urls: Mapped[dict] = mapped_column(JSON, default=list)
    engagement: Mapped[dict] = mapped_column(JSON, default=dict)
    sentiment: Mapped[str] = mapped_column(String(16), default="neutral")
    sentiment_confidence: Mapped[float] = mapped_column(Float, default=0.88)
    data_source: Mapped[str] = mapped_column(String(16), default="synthetic")

class SentimentResultModel(Base):
    __tablename__ = "sentiment_results"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    event_id: Mapped[str] = mapped_column(String(64), nullable=False)
    sentiment: Mapped[str] = mapped_column(String(16), nullable=False)
    emotions: Mapped[dict] = mapped_column(JSON, default=dict)
    confidence: Mapped[float] = mapped_column(Float, nullable=False)
    sarcasm_uncertain: Mapped[bool] = mapped_column(Boolean, default=False)
    model_name: Mapped[str] = mapped_column(String(64), default="xlm-roberta-sentiment")
    model_version: Mapped[str] = mapped_column(String(32), default="v3.1")
    processed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
