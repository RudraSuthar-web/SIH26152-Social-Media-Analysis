from datetime import datetime, timezone
from fastapi import APIRouter, Request, Query
from app.schemas.common import ApiResponse, ApiMeta
from app.schemas.events import CanonicalEvent

router = APIRouter(prefix="/events", tags=["Canonical Events"])

MOCK_EVENTS: list[CanonicalEvent] = [
  CanonicalEvent(
    event_id="evt-1001",
    platform="x",
    source_event_id="src-x-9912",
    source_user_id="usr_8f4a12",
    text="Critical update on cyber defense frameworks: NTRO initiative for social media analytics! #CyberSecurity #NTRO",
    language="en",
    detected_language_confidence=0.98,
    event_timestamp=datetime.now(timezone.utc).isoformat(),
    ingested_at=datetime.now(timezone.utc).isoformat(),
    conversation_id="conv-4401",
    mentions=["@NTRO_India"],
    hashtags=["#CyberSecurity", "#NTRO"],
    urls=["https://sih.gov.in/ps/26152"],
    sentiment="positive",
    sentiment_confidence=0.94,
    data_source="synthetic"
  ),
  CanonicalEvent(
    event_id="evt-1002",
    platform="telegram",
    source_event_id="src-tg-8819",
    source_user_id="usr_3b91e7",
    text="સાયબર સિક્યુરિટી અને નેશનલ ટેકનિકલ રિસર્ચ ઓર્ગેનાઇઝેશન પ્લેટફોર્મ. #CyberSec #NTRO",
    language="gu",
    detected_language_confidence=0.92,
    translated_text="Cybersecurity and National Technical Research Organisation platform.",
    event_timestamp=datetime.now(timezone.utc).isoformat(),
    ingested_at=datetime.now(timezone.utc).isoformat(),
    conversation_id="conv-4402",
    mentions=[],
    hashtags=["#CyberSec", "#NTRO"],
    urls=[],
    sentiment="neutral",
    sentiment_confidence=0.89,
    data_source="synthetic"
  ),
  CanonicalEvent(
    event_id="evt-1003",
    platform="x",
    source_event_id="src-x-7711",
    source_user_id="usr_c12a89",
    text="Wow, another policy update... sure, this will totally fix server latency 🙄 #SarcasmCheck",
    language="hinglish",
    detected_language_confidence=0.85,
    event_timestamp=datetime.now(timezone.utc).isoformat(),
    ingested_at=datetime.now(timezone.utc).isoformat(),
    sentiment="negative",
    sentiment_confidence=0.78,
    data_source="synthetic"
  )
]

@router.get("", response_model=ApiResponse[list[CanonicalEvent]])
async def get_events(request: Request, platform: str = Query("all")):
    req_id = getattr(request.state, "request_id", "req-events")
    filtered = MOCK_EVENTS if platform == "all" else [e for e in MOCK_EVENTS if e.platform == platform]
    return ApiResponse(
        data=filtered,
        meta=ApiMeta(request_id=req_id, data_source="synthetic")
    )

@router.get("/{event_id}", response_model=ApiResponse[CanonicalEvent])
async def get_event_by_id(request: Request, event_id: str):
    req_id = getattr(request.state, "request_id", "req-event-id")
    match = next((e for e in MOCK_EVENTS if e.event_id == event_id), MOCK_EVENTS[0])
    return ApiResponse(
        data=match,
        meta=ApiMeta(request_id=req_id, data_source="synthetic")
    )
