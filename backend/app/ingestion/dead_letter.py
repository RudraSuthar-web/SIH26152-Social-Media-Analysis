import uuid
import logging
from datetime import datetime, timezone
from typing import List, Dict, Any

from app.database import AsyncSessionLocal
from app.models.health import DeadLetterEventModel

logger = logging.getLogger(__name__)

class DeadLetterQueue:
    """Production Dead Letter Queue: DB-persisted dead-letter events."""

    def __init__(self):
        self._in_memory_dlq: List[Dict[str, Any]] = []

    async def push(self, event_raw: Any, error_reason: str, platform: str = "unknown"):
        record_id = f"dlq-{uuid.uuid4().hex[:8]}"
        now = datetime.now(timezone.utc)
        record = {
            "id": record_id,
            "platform": platform,
            "error_code": "VALIDATION_FAILED",
            "error_message": error_reason,
            "received_at": now.isoformat(),
            "retry_count": 0,
            "raw_payload_snippet": str(event_raw)[:500]
        }
        self._in_memory_dlq.append(record)

        try:
            async with AsyncSessionLocal() as session:
                async with session.begin():
                    model = DeadLetterEventModel(
                        id=record_id,
                        platform=platform,
                        error_code="VALIDATION_FAILED",
                        error_message=error_reason,
                        received_at=now,
                        retry_count=0,
                        raw_payload_snippet=str(event_raw)[:500]
                    )
                    session.add(model)
                    await session.commit()
            logger.warning(f"Dead Letter Event persisted to DB: {record_id} ({error_reason})")
        except Exception as e:
            logger.error(f"Failed to persist DLQ event to DB: {e}")

    def get_all(self) -> List[Dict[str, Any]]:
        return list(self._in_memory_dlq)

    def size(self) -> int:
        return len(self._in_memory_dlq)

dlq = DeadLetterQueue()
