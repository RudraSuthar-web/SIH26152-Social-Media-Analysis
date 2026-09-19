import uuid
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, HTTPException, BackgroundTasks, Body
from pydantic import BaseModel, Field

from app.schemas.common import ApiResponse, ApiMeta
from app.ingestion.pipeline import pipeline
from app.adapters.registry import registry
from app.ingestion.dead_letter import dlq

router = APIRouter()

class IngestionTriggerRequest(BaseModel):
    platform: str = Field(default="x", description="Platform identifier: 'x', 'telegram', etc.")
    lookback_minutes: int = Field(default=60, ge=1, le=1440, description="Lookback window in minutes")

class IngestionJobStatus(BaseModel):
    job_id: str
    status: str
    platform: str
    processed_count: int
    duplicate_count: int
    invalid_count: int
    timestamp: str

@router.post("/ingestion/trigger", response_model=ApiResponse[IngestionJobStatus])
async def trigger_ingestion(payload: Optional[IngestionTriggerRequest] = Body(None)):
    if payload is None:
        payload = IngestionTriggerRequest()

    try:
        result = await pipeline.run_ingestion_job(
            platform=payload.platform,
            lookback_minutes=payload.lookback_minutes
        )
        job_id = f"job_{uuid.uuid4().hex[:12]}"

        status_data = IngestionJobStatus(
            job_id=job_id,
            status="completed",
            platform=result["platform"],
            processed_count=result["processed_count"],
            duplicate_count=result["duplicate_count"],
            invalid_count=result["invalid_count"],
            timestamp=datetime.now(timezone.utc).isoformat()
        )

        return ApiResponse(
            data=status_data,
            meta=ApiMeta(request_id=f"req-{job_id}", data_source="live")
        )
    except KeyError:
        raise HTTPException(status_code=400, detail=f"Unsupported platform: '{payload.platform}'")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ingestion job failed: {str(e)}")

@router.get("/ingestion/status", response_model=ApiResponse[dict])
async def get_ingestion_status():
    adapters_health = await registry.get_all_health()
    return ApiResponse(
        data={
            "adapters": adapters_health,
            "dead_letter_queue_size": dlq.size(),
            "status": "operational"
        },
        meta=ApiMeta(request_id="req-admin-status", data_source="live")
    )
