from datetime import datetime, timezone
from fastapi import APIRouter, Request, Query
from app.schemas.common import ApiResponse, ApiMeta
from app.schemas.sentiment import (
    SentimentTimePoint, EmotionBreakdown, ConfidenceBucket, SarcasmPoint, LanguageSentimentMatrix
)

router = APIRouter(prefix="/sentiment", tags=["Sentiment Analytics"])

@router.get("/timeline", response_model=ApiResponse[list[SentimentTimePoint]])
async def get_sentiment_timeline(request: Request, range: str = Query("24h")):
    req_id = getattr(request.state, "request_id", "req-sentiment-timeline")
    timeline = [
        SentimentTimePoint(timestamp="00:00", positive=450, negative=120, neutral=320, sarcasm_flagged=25, total=890),
        SentimentTimePoint(timestamp="04:00", positive=520, negative=110, neutral=290, sarcasm_flagged=30, total=920),
        SentimentTimePoint(timestamp="08:00", positive=680, negative=210, neutral=410, sarcasm_flagged=55, total=1300),
        SentimentTimePoint(timestamp="12:00", positive=890, negative=310, neutral=540, sarcasm_flagged=80, total=1740),
        SentimentTimePoint(timestamp="16:00", positive=740, negative=250, neutral=480, sarcasm_flagged=60, total=1470),
        SentimentTimePoint(timestamp="20:00", positive=610, negative=180, neutral=390, sarcasm_flagged=40, total=1180),
        SentimentTimePoint(timestamp="24:00", positive=580, negative=140, neutral=350, sarcasm_flagged=35, total=1070)
    ]
    return ApiResponse(
        data=timeline,
        meta=ApiMeta(request_id=req_id, data_source="synthetic")
    )

@router.get("/emotions", response_model=ApiResponse[EmotionBreakdown])
async def get_emotion_aggregate(request: Request):
    req_id = getattr(request.state, "request_id", "req-emotions")
    emotions = EmotionBreakdown(
        anger=0.12,
        anxiety=0.18,
        excitement=0.45,
        supportive=0.62,
        opposing=0.15,
        sarcasm=0.08,
        uncertainty=0.05
    )
    return ApiResponse(
        data=emotions,
        meta=ApiMeta(request_id=req_id, data_source="synthetic")
    )

@router.get("/confidence-histogram", response_model=ApiResponse[list[ConfidenceBucket]])
async def get_confidence_histogram(request: Request):
    req_id = getattr(request.state, "request_id", "req-conf-hist")
    buckets = [
        ConfidenceBucket(bucket="50-60%", positive=120, negative=85, neutral=210),
        ConfidenceBucket(bucket="60-70%", positive=340, negative=190, neutral=450),
        ConfidenceBucket(bucket="70-80%", positive=780, negative=430, neutral=620),
        ConfidenceBucket(bucket="80-90%", positive=1450, negative=890, neutral=910),
        ConfidenceBucket(bucket="90-100%", positive=2890, negative=1420, neutral=1240)
    ]
    return ApiResponse(
        data=buckets,
        meta=ApiMeta(request_id=req_id, data_source="synthetic")
    )

@router.get("/sarcasm-scatter", response_model=ApiResponse[list[SarcasmPoint]])
async def get_sarcasm_scatter(request: Request):
    req_id = getattr(request.state, "request_id", "req-sarcasm")
    points = [
        SarcasmPoint(confidence=0.88, sarcasm_score=0.12, uncertain=False, language="en"),
        SarcasmPoint(confidence=0.76, sarcasm_score=0.82, uncertain=True, language="hinglish"),
        SarcasmPoint(confidence=0.92, sarcasm_score=0.05, uncertain=False, language="hi"),
        SarcasmPoint(confidence=0.64, sarcasm_score=0.74, uncertain=True, language="hinglish"),
        SarcasmPoint(confidence=0.95, sarcasm_score=0.15, uncertain=False, language="gu")
    ]
    return ApiResponse(
        data=points,
        meta=ApiMeta(request_id=req_id, data_source="synthetic")
    )

@router.get("/language-heatmap", response_model=ApiResponse[list[LanguageSentimentMatrix]])
async def get_language_heatmap(request: Request):
    req_id = getattr(request.state, "request_id", "req-lang-heat")
    matrix = [
        LanguageSentimentMatrix(language="English (EN)", positive=64, neutral=24, negative=12, avgConfidence=0.94),
        LanguageSentimentMatrix(language="Hindi (HI)", positive=58, neutral=28, negative=14, avgConfidence=0.91),
        LanguageSentimentMatrix(language="Hinglish (HI-EN)", positive=45, neutral=35, negative=20, avgConfidence=0.84),
        LanguageSentimentMatrix(language="Bengali (BN)", positive=60, neutral=25, negative=15, avgConfidence=0.88),
        LanguageSentimentMatrix(language="Gujarati (GU)", positive=62, neutral=26, negative=12, avgConfidence=0.90)
    ]
    return ApiResponse(
        data=matrix,
        meta=ApiMeta(request_id=req_id, data_source="synthetic")
    )
