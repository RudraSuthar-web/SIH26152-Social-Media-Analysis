from typing import Optional
from pydantic import BaseModel

class EmotionBreakdown(BaseModel):
    anger: float = 0.12
    anxiety: float = 0.18
    excitement: float = 0.45
    supportive: float = 0.62
    opposing: float = 0.15
    sarcasm: float = 0.08
    uncertainty: float = 0.05

class SentimentTimePoint(BaseModel):
    timestamp: str
    positive: int = 0
    negative: int = 0
    neutral: int = 0
    sarcasm_flagged: int = 0
    total: int = 0

class ConfidenceBucket(BaseModel):
    bucket: str
    positive: int
    negative: int
    neutral: int

class SarcasmPoint(BaseModel):
    confidence: float
    sarcasm_score: float
    uncertain: bool
    language: str

class LanguageSentimentMatrix(BaseModel):
    language: str
    positive: int
    neutral: int
    negative: int
    avgConfidence: float
