from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, Field

class EngagementMetrics(BaseModel):
    likes: int = 0
    shares: int = 0
    replies: int = 0
    views: Optional[int] = 0

class CanonicalEvent(BaseModel):
    event_id: str
    platform: Literal["x", "telegram", "instagram", "facebook", "reddit", "youtube"]
    source_event_id: str
    source_user_id: str
    text: str
    language: str = "en"
    detected_language_confidence: Optional[float] = 0.95
    translated_text: Optional[str] = None
    event_timestamp: str
    ingested_at: str
    processed_at: Optional[str] = None
    conversation_id: Optional[str] = None
    parent_event_id: Optional[str] = None
    mentions: list[str] = Field(default_factory=list)
    hashtags: list[str] = Field(default_factory=list)
    urls: list[str] = Field(default_factory=list)
    engagement: EngagementMetrics = Field(default_factory=EngagementMetrics)
    sentiment: Optional[Literal["positive", "negative", "neutral"]] = "neutral"
    sentiment_confidence: Optional[float] = 0.88
    data_source: Literal["live", "synthetic", "replay", "degraded", "offline"] = "synthetic"
