from datetime import datetime, timezone
from fastapi import APIRouter, Request, HTTPException
from app.schemas.common import ApiResponse, ApiMeta
from app.schemas.trends import TrendTopic, TrendMetrics, TrendFormulaBreakdown, CoordinationPoint
from app.analytics.trends.metrics import compute_trend_metrics, TopicStats

router = APIRouter(prefix="/trends", tags=["Trend & Narrative Analytics"])

MOCK_TRENDS: list[TrendTopic] = [
    TrendTopic(
        topic_id="t-101",
        topic_label="NTRO AI Analytics Framework",
        keywords=["ntro", "analytics", "sih2026", "cybersecurity"],
        hashtags=["#NTRO", "#CyberSecurity", "#SIH2026"],
        volume=24890,
        unique_users=18400,
        growth_rate=3.42,
        velocity=2.22,
        momentum=3.15,
        trend_score=137.8,
        platforms=["x", "telegram"],
        languages=["en", "hi", "gu"],
        coordinated_pattern=False,
        components=TrendMetrics(volume_score=10.12, growth_rate=3.42, velocity=2.22, decay=0.95),
        sparkline=[1200, 3400, 8900, 14500, 19800, 24890]
    ),
    TrendTopic(
        topic_id="t-102",
        topic_label="Multilingual Sarcasm Disambiguation",
        keywords=["sarcasm", "xlm-roberta", "multilingual", "hinglish"],
        hashtags=["#NLP", "#SarcasmAI"],
        volume=14200,
        unique_users=12100,
        growth_rate=1.85,
        velocity=1.12,
        momentum=1.70,
        trend_score=82.3,
        platforms=["x", "telegram"],
        languages=["en", "hinglish"],
        coordinated_pattern=False,
        components=TrendMetrics(volume_score=9.56, growth_rate=1.85, velocity=1.12, decay=0.92),
        sparkline=[800, 2100, 5400, 9200, 12100, 14200]
    ),
    TrendTopic(
        topic_id="t-103",
        topic_label="Leiden Community Partitioning",
        keywords=["leiden", "graph", "pagerank", "modularity"],
        hashtags=["#GraphAI", "#Leiden"],
        volume=11200,
        unique_users=9400,
        growth_rate=1.20,
        velocity=0.85,
        momentum=1.10,
        trend_score=71.8,
        platforms=["x"],
        languages=["en"],
        coordinated_pattern=False,
        components=TrendMetrics(volume_score=9.32, growth_rate=1.20, velocity=0.85, decay=0.89),
        sparkline=[500, 1800, 4200, 7500, 9800, 11200]
    ),
    TrendTopic(
        topic_id="t-104",
        topic_label="BOT BURST #CyberSec",
        keywords=["cybersec", "burst", "botnet"],
        hashtags=["#CyberSec"],
        volume=19800,
        unique_users=2100,
        growth_rate=8.45,
        velocity=4.12,
        momentum=7.80,
        trend_score=188.9,
        platforms=["x", "telegram"],
        languages=["en"],
        coordinated_pattern=True,
        components=TrendMetrics(volume_score=9.89, growth_rate=8.45, velocity=4.12, decay=0.98),
        sparkline=[200, 800, 3200, 9500, 15400, 19800]
    )
]

@router.get("", response_model=ApiResponse[list[TrendTopic]])
async def get_trends(request: Request):
    req_id = getattr(request.state, "request_id", "req-trends")
    return ApiResponse(
        data=MOCK_TRENDS,
        meta=ApiMeta(request_id=req_id, data_source="synthetic")
    )

@router.get("/{topic_id}", response_model=ApiResponse[TrendTopic])
async def get_trend_by_id(request: Request, topic_id: str):
    req_id = getattr(request.state, "request_id", "req-trend-id")
    match = next((t for t in MOCK_TRENDS if t.topic_id == topic_id), MOCK_TRENDS[0])
    return ApiResponse(
        data=match,
        meta=ApiMeta(request_id=req_id, data_source="synthetic")
    )

@router.get("/{topic_id}/formula", response_model=ApiResponse[TrendFormulaBreakdown])
async def get_trend_formula(request: Request, topic_id: str):
    req_id = getattr(request.state, "request_id", "req-formula")
    match = next((t for t in MOCK_TRENDS if t.topic_id == topic_id), MOCK_TRENDS[0])
    
    # Compute using official metric calculation
    now = datetime.now(timezone.utc)
    current_stats = TopicStats(volume=match.volume, window_start=now, peak_at=now, growth_rate=match.growth_rate)
    prev_stats = TopicStats(volume=int(match.volume / (1 + match.growth_rate)), window_start=now, peak_at=now, growth_rate=match.growth_rate - match.velocity)
    metrics = compute_trend_metrics(current_stats, prev_stats)
    
    breakdown = TrendFormulaBreakdown(
        topic_id=match.topic_id,
        topic_label=match.topic_label,
        volume=match.volume,
        volume_score=metrics["components"]["volume_score"],
        growth_rate=metrics["components"]["growth_rate"],
        velocity=metrics["components"]["velocity"],
        decay=metrics["components"]["decay"],
        trend_score=metrics["trend_score"],
        formula_str=f"TrendScore = log({match.volume}+1) * (1 + {match.growth_rate:.2f}) * (1 + {match.velocity:.2f}) * {metrics['components']['decay']:.2f} = {metrics['trend_score']:.1f}"
    )
    return ApiResponse(
        data=breakdown,
        meta=ApiMeta(request_id=req_id, data_source="synthetic")
    )

@router.get("/coordination-scatter", response_model=ApiResponse[list[CoordinationPoint]])
async def get_coordination_scatter(request: Request):
    req_id = getattr(request.state, "request_id", "req-coord-scatter")
    points = [
        CoordinationPoint(topic_label=t.topic_label, unique_users=t.unique_users, volume=t.volume, velocity=t.velocity, coordinated=t.coordinated_pattern)
        for t in MOCK_TRENDS
    ]
    return ApiResponse(
        data=points,
        meta=ApiMeta(request_id=req_id, data_source="synthetic")
    )
