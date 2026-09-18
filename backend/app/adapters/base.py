import asyncio
import logging
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import AsyncIterator, Optional

logger = logging.getLogger(__name__)

@dataclass
class RawPlatformEvent:
    platform: str
    source_event_id: str
    source_user_id: str
    text: str
    event_timestamp: datetime
    conversation_id: Optional[str] = None
    parent_event_id: Optional[str] = None
    mentions: list[str] = field(default_factory=list)
    hashtags: list[str] = field(default_factory=list)
    urls: list[str] = field(default_factory=list)
    engagement: dict = field(default_factory=dict)
    metadata: dict = field(default_factory=dict)

class BaseAdapter(ABC):
    platform: str

    def __init__(self, config: dict):
        self.config = config

    @abstractmethod
    async def fetch_events(self, since: datetime, until: datetime) -> AsyncIterator[RawPlatformEvent]:
        pass

    @abstractmethod
    async def health_check(self) -> dict:
        pass
