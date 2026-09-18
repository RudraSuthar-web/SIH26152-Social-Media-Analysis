from typing import Optional
from pydantic import BaseModel, Field

class TrendMetrics(BaseModel):
    volume_score: float
    growth_rate: float
    velocity: float
    decay: float

class TrendTopic(BaseModel):
    topic_id: str
    topic_label: str
    keywords: list[str] = Field(default_factory=list)
    hashtags: list[str] = Field(default_factory=list)
    volume: int
    unique_users: int
    growth_rate: float
    velocity: float
    momentum: float
    trend_score: float
    platforms: list[str] = Field(default_factory=list)
    languages: list[str] = Field(default_factory=list)
    coordinated_pattern: bool = False
    components: TrendMetrics
    sparkline: list[int] = Field(default_factory=list)

class TrendFormulaBreakdown(BaseModel):
    topic_id: str
    topic_label: str
    volume: int
    volume_score: float
    growth_rate: float
    velocity: float
    decay: float
    trend_score: float
    formula_str: str

class CoordinationPoint(BaseModel):
    topic_label: str
    unique_users: int
    volume: int
    velocity: float
    coordinated: bool
