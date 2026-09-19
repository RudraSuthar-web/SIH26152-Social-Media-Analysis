import json
import logging
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any
import redis.asyncio as aioredis

from app.config import settings
from app.adapters.registry import registry
from app.ingestion.validator import EventValidator
from app.ingestion.normalizer import EventNormalizer
from app.ingestion.deduplicator import EventDeduplicator
from app.ingestion.dead_letter import dlq
from app.database import AsyncSessionLocal
from app.models.events import CanonicalEventModel

logger = logging.getLogger(__name__)

class IngestionPipeline:
    """Production Ingestion Pipeline: Adapter -> Validate -> Normalize -> Deduplicate -> DB Persist -> Redis Stream."""

    def __init__(self):
        self.deduplicator = EventDeduplicator()

    async def _publish_to_redis_stream(self, events: List[Dict[str, Any]]):
        """Publish normalized events to Redis Stream 'events:raw'."""
        try:
            r = aioredis.from_url(settings.redis.url)
            for evt in events:
                await r.xadd("events:raw", {"payload": json.dumps(evt)})
            await r.aclose()
            logger.info(f"Published {len(events)} events to Redis stream 'events:raw'")
        except Exception as e:
            logger.warning(f"Failed to publish events to Redis Stream: {e}")

    async def run_ingestion_job(self, platform: str, lookback_minutes: int = 60) -> Dict[str, Any]:
        adapter = registry.get_adapter(platform)
        until = datetime.now(timezone.utc)
        since = until - timedelta(minutes=lookback_minutes)

        processed = 0
        duplicates = 0
        invalid = 0
        normalized_events: List[Dict[str, Any]] = []
        db_models: List[CanonicalEventModel] = []

        logger.info(f"Starting ingestion job for platform='{platform}' from {since.isoformat()} to {until.isoformat()}")

        async for raw_event in adapter.fetch_events(since, until):
            # 1. Validation
            is_valid, reason = EventValidator.validate(raw_event)
            if not is_valid:
                await dlq.push(raw_event, reason, platform=platform)
                invalid += 1
                continue

            # 2. Normalization
            normalized = EventNormalizer.normalize(raw_event)

            # 3. Redis-backed Deduplication
            is_dup = await self.deduplicator.is_duplicate_async(normalized["event_hash"])
            if is_dup:
                duplicates += 1
                continue

            # 4. Canonical Model Construction for DB Persistence
            event_ts = datetime.fromisoformat(normalized["event_timestamp"])
            model = CanonicalEventModel(
                event_id=f"evt-{normalized['event_hash'][:12]}",
                platform=normalized["platform"],
                source_event_id=normalized["source_event_id"],
                source_user_id=raw_event.source_user_id,
                node_id=normalized["node_id"],
                text=normalized["text"],
                language=normalized["metadata"].get("lang", "en"),
                detected_language_confidence=0.95,
                event_timestamp=event_ts,
                ingested_at=datetime.now(timezone.utc),
                conversation_id=normalized["conversation_id"],
                parent_event_id=normalized["parent_event_id"],
                mentions=normalized["mentions"],
                hashtags=normalized["hashtags"],
                urls=normalized["urls"],
                engagement=normalized["engagement"],
                sentiment="neutral",
                sentiment_confidence=0.88,
                data_source=normalized["data_source"].lower()
            )
            db_models.append(model)
            normalized_events.append(normalized)
            processed += 1

        # 5. Database Persistence & Redis Stream Publishing
        if db_models:
            async with AsyncSessionLocal() as session:
                async with session.begin():
                    for model in db_models:
                        await session.merge(model)
                    await session.commit()
            logger.info(f"Persisted {len(db_models)} canonical events to PostgreSQL database")

            # Publish to Redis Stream 'events:raw'
            await self._publish_to_redis_stream(normalized_events)

        return {
            "platform": platform,
            "processed_count": processed,
            "duplicate_count": duplicates,
            "invalid_count": invalid,
            "events": normalized_events
        }

pipeline = IngestionPipeline()
