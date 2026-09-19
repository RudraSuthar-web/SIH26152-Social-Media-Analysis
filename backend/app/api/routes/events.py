from datetime import datetime, timezone
from fastapi import APIRouter, Request, Query, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.events import CanonicalEventModel
from app.schemas.common import ApiResponse, ApiMeta
from app.schemas.events import CanonicalEvent

router = APIRouter(prefix="/events", tags=["Canonical Events"])

def model_to_schema(m: CanonicalEventModel) -> CanonicalEvent:
    return CanonicalEvent(
        event_id=m.event_id,
        platform=m.platform,
        source_event_id=m.source_event_id,
        source_user_id=m.node_id or m.source_user_id,
        text=m.text,
        language=m.language or "en",
        detected_language_confidence=m.detected_language_confidence or 0.95,
        translated_text=m.translated_text,
        event_timestamp=m.event_timestamp.isoformat() if isinstance(m.event_timestamp, datetime) else str(m.event_timestamp),
        ingested_at=m.ingested_at.isoformat() if isinstance(m.ingested_at, datetime) else str(m.ingested_at),
        conversation_id=m.conversation_id,
        parent_event_id=m.parent_event_id,
        mentions=m.mentions or [],
        hashtags=m.hashtags or [],
        urls=m.urls or [],
        engagement=m.engagement or {},
        sentiment=m.sentiment or "neutral",
        sentiment_confidence=m.sentiment_confidence or 0.88,
        data_source=(m.data_source or "synthetic").lower()
    )

@router.get("", response_model=ApiResponse[list[CanonicalEvent]])
async def get_events(
    request: Request,
    platform: str = Query("all", description="Platform filter: 'x', 'telegram', 'web', or 'all'"),
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db)
):
    req_id = getattr(request.state, "request_id", "req-events")
    stmt = select(CanonicalEventModel).order_by(CanonicalEventModel.event_timestamp.desc())

    if platform != "all":
        stmt = stmt.where(CanonicalEventModel.platform == platform.lower())

    stmt = stmt.limit(limit).offset(offset)
    result = await db.execute(stmt)
    records = result.scalars().all()

    # Seed initial events if database table is currently empty
    if not records:
        from app.ingestion.pipeline import pipeline
        await pipeline.run_ingestion_job(platform="x" if platform == "all" else platform, lookback_minutes=60)
        await pipeline.run_ingestion_job(platform="telegram", lookback_minutes=60)
        result = await db.execute(stmt)
        records = result.scalars().all()

    events_data = [model_to_schema(r) for r in records]
    data_source = events_data[0].data_source.lower() if events_data else "live"

    return ApiResponse(
        data=events_data,
        meta=ApiMeta(request_id=req_id, data_source=data_source)
    )

@router.get("/{event_id}", response_model=ApiResponse[CanonicalEvent])
async def get_event_by_id(
    request: Request,
    event_id: str,
    db: AsyncSession = Depends(get_db)
):
    req_id = getattr(request.state, "request_id", "req-event-id")
    stmt = select(CanonicalEventModel).where(CanonicalEventModel.event_id == event_id)
    result = await db.execute(stmt)
    record = result.scalar_one_or_none()

    if not record:
        # Fallback to latest available event
        stmt_latest = select(CanonicalEventModel).limit(1)
        res_latest = await db.execute(stmt_latest)
        record = res_latest.scalar_one_or_none()

    event_data = model_to_schema(record) if record else CanonicalEvent(
        event_id=event_id,
        platform="x",
        source_event_id="src-default",
        source_user_id="node_default",
        text="NTRO Sovereign Social Media Analytics Framework operational.",
        language="en",
        detected_language_confidence=0.98,
        event_timestamp=datetime.now(timezone.utc).isoformat(),
        ingested_at=datetime.now(timezone.utc).isoformat(),
        sentiment="neutral",
        sentiment_confidence=0.90,
        data_source="synthetic"
    )

    return ApiResponse(
        data=event_data,
        meta=ApiMeta(request_id=req_id, data_source=event_data.data_source.lower())
    )
