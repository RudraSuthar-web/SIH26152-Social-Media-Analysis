import logging
from typing import Dict, Type
from app.adapters.base import BaseAdapter
from app.adapters.x_adapter import XAdapter
from app.adapters.telegram_adapter import TelegramAdapter

logger = logging.getLogger(__name__)

class AdapterRegistry:
    def __init__(self):
        self._adapters: Dict[str, BaseAdapter] = {}
        self._register_defaults()

    def _register_defaults(self):
        self.register("x", XAdapter({"provider": "synthetic"}))
        self.register("telegram", TelegramAdapter({"allow_synthetic": True}))

    def register(self, platform: str, adapter: BaseAdapter):
        self._adapters[platform.lower()] = adapter
        logger.info(f"Registered adapter for platform: {platform}")

    def get_adapter(self, platform: str) -> BaseAdapter:
        platform_key = platform.lower()
        if platform_key not in self._adapters:
            raise KeyError(f"No adapter registered for platform: '{platform}'")
        return self._adapters[platform_key]

    def list_adapters(self) -> Dict[str, str]:
        return {name: adapter.__class__.__name__ for name, adapter in self._adapters.items()}

    async def get_all_health(self) -> Dict[str, dict]:
        health_status = {}
        for name, adapter in self._adapters.items():
            try:
                health_status[name] = await adapter.health_check()
            except Exception as e:
                health_status[name] = {"platform": name, "status": "unhealthy", "error": str(e)}
        return health_status

# Global singleton adapter registry
registry = AdapterRegistry()
