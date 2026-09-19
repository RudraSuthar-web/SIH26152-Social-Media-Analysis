import logging
from datetime import datetime, timezone
from typing import Tuple
from app.adapters.base import RawPlatformEvent

logger = logging.getLogger(__name__)

class EventValidator:
    """Validates raw platform events for schema correctness and invariant compliance."""

    @staticmethod
    def validate(event: RawPlatformEvent) -> Tuple[bool, str]:
        if not event.platform or not isinstance(event.platform, str):
            return False, "Missing or invalid platform identifier"

        if not event.source_event_id or not str(event.source_event_id).strip():
            return False, "Missing or empty source_event_id"

        if not event.source_user_id or not str(event.source_user_id).strip():
            return False, "Missing or empty source_user_id"

        if event.text is None:
            return False, "Event text cannot be None"

        if not isinstance(event.event_timestamp, datetime):
            return False, "Invalid event_timestamp type"

        # Check for future timestamp drift (>5 minutes into future)
        now = datetime.now(timezone.utc)
        event_ts = event.event_timestamp if event.event_timestamp.tzinfo else event.event_timestamp.replace(tzinfo=timezone.utc)
        if (event_ts - now).total_seconds() > 300:
            return False, "Event timestamp is significantly in the future"

        return True, "Valid"
