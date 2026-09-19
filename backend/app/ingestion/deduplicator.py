import logging
from typing import Set
import redis.asyncio as aioredis
from app.config import settings

logger = logging.getLogger(__name__)

class EventDeduplicator:
    """Production Redis-backed & In-Memory event deduplication buffer."""

    def __init__(self, max_capacity: int = 10000):
        self._seen_hashes: Set[str] = set()
        self.max_capacity = max_capacity
        self.redis_url = settings.redis.url

    async def is_duplicate_async(self, event_hash: str, ttl_seconds: int = 86400) -> bool:
        """Check Redis key for distributed deduplication across processes."""
        try:
            r = aioredis.from_url(self.redis_url)
            key = f"events:seen:{event_hash}"
            is_new = await r.set(key, "1", nx=True, ex=ttl_seconds)
            await r.aclose()
            if not is_new:
                return True
        except Exception as e:
            logger.warning(f"Redis deduplication check failed ({e}), falling back to in-memory buffer")
            return self.is_duplicate(event_hash)

        self._seen_hashes.add(event_hash)
        return False

    def is_duplicate(self, event_hash: str) -> bool:
        if event_hash in self._seen_hashes:
            return True

        if len(self._seen_hashes) >= self.max_capacity:
            logger.info("Deduplicator in-memory buffer reached capacity; resetting oldest half")
            self._seen_hashes = set(list(self._seen_hashes)[self.max_capacity // 2:])

        self._seen_hashes.add(event_hash)
        return False
