from datetime import datetime, timezone
from fastapi import APIRouter, Request, Body
from app.schemas.common import ApiResponse, ApiMeta
from app.schemas.health import (
    AdapterHealth, ModelHealth, DeadLetterEntry, OverviewMetrics, ModelEvaluationData
)
from app.schemas.admin import BackfillRequest, BackfillJobResponse

router = APIRouter(tags=["Telemetry & System Health"])

@router.get("/metrics/overview", response_model=ApiResponse[OverviewMetrics])
async def get_overview_metrics(request: Request):
    req_id = getattr(request.state, "request_id", "req-overview")
    metrics = OverviewMetrics(
        total_events_24h=148290,
        events_trend_pct=12.3,
        active_accounts_24h=18450,
        trending_topics_count=12,
        sentiment_distribution={"positive": 0.62, "neutral": 0.26, "negative": 0.12},
        adapter_health={"x": "healthy", "telegram": "healthy"}
    )
    return ApiResponse(
        data=metrics,
        meta=ApiMeta(request_id=req_id, data_source="synthetic")
    )

@router.get("/admin/ingestion/status", response_model=ApiResponse[list[AdapterHealth]])
async def get_adapter_health(request: Request):
    req_id = getattr(request.state, "request_id", "req-adapter-health")
    adapters = [
        AdapterHealth(
            platform="x",
            enabled=True,
            healthy=True,
            status="healthy",
            lag_seconds=0.8,
            rate_limit_usage_pct=34,
            events_ingested_24h=89400,
            last_success_at=datetime.now(timezone.utc).isoformat(),
            error_count=2
        ),
        AdapterHealth(
            platform="telegram",
            enabled=True,
            healthy=True,
            status="healthy",
            lag_seconds=1.2,
            rate_limit_usage_pct=18,
            events_ingested_24h=42100,
            last_success_at=datetime.now(timezone.utc).isoformat(),
            error_count=0
        )
    ]
    return ApiResponse(
        data=adapters,
        meta=ApiMeta(request_id=req_id, data_source="synthetic")
    )

@router.post("/admin/ingestion/trigger", response_model=ApiResponse[BackfillJobResponse])
async def trigger_ingestion(request: Request, body: BackfillRequest = Body(...)):
    req_id = getattr(request.state, "request_id", "req-ingest-trigger")
    job = BackfillJobResponse(
        job_id=f"job-{body.platform}-{int(datetime.now(timezone.utc).timestamp())}",
        platform=body.platform,
        status="scheduled",
        scheduled_at=datetime.now(timezone.utc).isoformat()
    )
    return ApiResponse(
        data=job,
        meta=ApiMeta(request_id=req_id, data_source="synthetic")
    )

@router.get("/admin/models/status", response_model=ApiResponse[list[ModelHealth]])
async def get_model_health(request: Request):
    req_id = getattr(request.state, "request_id", "req-model-health")
    models = [
        ModelHealth(
            model_name="cardiffnlp/twitter-xlm-roberta-base-sentiment",
            version="v3.1 (ONNX)",
            p95_latency_ms=18.4,
            p99_latency_ms=32.1,
            error_rate_pct=0.02,
            total_inferences=148290,
            status="optimal"
        ),
        ModelHealth(
            model_name="fasttext-lid-176",
            version="v1.0.2",
            p95_latency_ms=1.2,
            p99_latency_ms=2.5,
            error_rate_pct=0.0,
            total_inferences=148290,
            status="optimal"
        )
    ]
    return ApiResponse(
        data=models,
        meta=ApiMeta(request_id=req_id, data_source="synthetic")
    )

@router.get("/admin/ingestion/dead-letters", response_model=ApiResponse[list[DeadLetterEntry]])
async def get_dead_letters(request: Request):
    req_id = getattr(request.state, "request_id", "req-dlq")
    dlq = [
        DeadLetterEntry(
            id="dlq-9921",
            platform="x",
            error_code="RATE_LIMIT_EXCEEDED_429",
            error_message="X API v2 rate limit bucket empty for search/recent",
            received_at=datetime.now(timezone.utc).isoformat(),
            retry_count=3,
            raw_payload_snippet='{"query": "NTRO", "max_results": 100}'
        ),
        DeadLetterEntry(
            id="dlq-9922",
            platform="telegram",
            error_code="SCHEMA_VALIDATION_ERROR",
            error_message="Missing required field 'message_id' in MTProto updates payload",
            received_at=datetime.now(timezone.utc).isoformat(),
            retry_count=1,
            raw_payload_snippet='{"channel_id": 1024, "text": "Malformed..."}'
        )
    ]
    return ApiResponse(
        data=dlq,
        meta=ApiMeta(request_id=req_id, data_source="synthetic")
    )

@router.get("/models/evaluation", response_model=ApiResponse[list[ModelEvaluationData]])
async def get_model_evaluation(request: Request):
    req_id = getattr(request.state, "request_id", "req-model-eval")
    eval_data = [
        ModelEvaluationData(
            model_name="cardiffnlp/twitter-xlm-roberta-base-sentiment",
            version="v3.1 (ONNX)",
            macro_f1=0.912,
            precision=0.924,
            recall=0.901,
            latency_p95_ms=18.4,
            latency_p99_ms=32.1,
            drift_detected=False,
            languages_eval={
                "en": {"f1": 0.942, "samples": 45000},
                "hi": {"f1": 0.908, "samples": 32000},
                "hinglish": {"f1": 0.865, "samples": 21000},
                "gu": {"f1": 0.895, "samples": 14000},
                "bn": {"f1": 0.888, "samples": 12000}
            }
        )
    ]
    return ApiResponse(
        data=eval_data,
        meta=ApiMeta(request_id=req_id, data_source="synthetic")
    )
