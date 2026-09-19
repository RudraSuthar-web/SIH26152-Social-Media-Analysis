import asyncio
import logging
from abc import ABC, abstractmethod
from typing import Dict, Any

logger = logging.getLogger(__name__)

class BaseWorker(ABC):
    """Abstract base class for asynchronous stream processing workers."""
    worker_name: str

    def __init__(self):
        self._is_running = False
        self._processed_count = 0

    @abstractmethod
    async def process_batch(self, events: list[dict]) -> int:
        """Process a batch of normalized canonical events."""
        pass

    async def start(self):
        self._is_running = True
        logger.info(f"Worker '{self.worker_name}' started")

    async def stop(self):
        self._is_running = False
        logger.info(f"Worker '{self.worker_name}' stopped")

    def get_health(self) -> Dict[str, Any]:
        return {
            "worker": self.worker_name,
            "status": "running" if self._is_running else "stopped",
            "processed_count": self._processed_count
        }
