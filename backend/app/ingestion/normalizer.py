import hashlib
import logging
from datetime import datetime, timezone
from app.adapters.base import RawPlatformEvent

logger = logging.getLogger(__name__)

class EventNormalizer:
    """Normalizes raw platform events into canonical audit envelopes."""

    @staticmethod
    def hash_user_id(source_user_id: str) -> str:
        """Pseudonymize user identity per BRUTAL_AUDIT.md compliance."""
        digest = hashlib.sha256(source_user_id.encode('utf-8')).hexdigest()[:8]
        return f"node_{digest}"

    @classmethod
    def normalize(cls, event: RawPlatformEvent) -> dict:
        event_ts = event.event_timestamp
        if not event_ts.tzinfo:
            event_ts = event_ts.replace(tzinfo=timezone.utc)

        pseudonymized_node = cls.hash_user_id(event.source_user_id)
        
        # Calculate event hash for deduplication
        hash_str = f"{event.platform}:{event.source_event_id}"
        event_hash = hashlib.sha256(hash_str.encode('utf-8')).hexdigest()

        return {
            "event_hash": event_hash,
            "platform": event.platform.lower(),
            "source_event_id": str(event.source_event_id),
            "node_id": pseudonymized_node,
            "text": event.text,
            "event_timestamp": event_ts.isoformat(),
            "conversation_id": event.conversation_id or f"conv_{event_hash[:8]}",
            "parent_event_id": event.parent_event_id,
            "mentions": event.mentions or [],
            "hashtags": event.hashtags or [],
            "urls": event.urls or [],
            "engagement": event.engagement or {},
            "metadata": event.metadata or {},
            "data_source": event.metadata.get("data_source", "synthetic").upper(),
            "ingested_at": datetime.now(timezone.utc).isoformat()
        }
