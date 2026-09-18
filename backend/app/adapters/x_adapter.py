import random
from datetime import datetime, timezone
from typing import AsyncIterator
from app.adapters.base import BaseAdapter, RawPlatformEvent

class XAdapter(BaseAdapter):
    platform = "x"

    def __init__(self, config: dict):
        super().__init__(config)
        self.provider = config.get("provider", "synthetic")

    async def fetch_events(self, since: datetime, until: datetime) -> AsyncIterator[RawPlatformEvent]:
        async for event in self._generate_synthetic(since, until):
            yield event

    async def _generate_synthetic(self, since: datetime, until: datetime) -> AsyncIterator[RawPlatformEvent]:
        from faker import Faker
        fake = Faker()

        templates = [
            ("Critical update on cyber defense frameworks: NTRO initiative for social media analytics! #CyberSecurity #NTRO", "en"),
            ("NTRO National Cyber Security Hackathon: automated verification ensures 0 fake intelligence. #SIH2026", "en"),
            ("સાયબર સિક્યુરિટી અને નેશનલ ટેકનિકલ રિસર્ચ ઓર્ગેનાઇઝેશન પ્લેટફોર્મ. #CyberSec #NTRO", "gu"),
            ("साइबर सुरक्षा एवं राष्ट्रीय तकनीकी अनुसंधान संगठन: सोशल मीडिया इंटेलिजेंस ढांचा। #CyberSecurity #NTRO", "hi"),
            ("Wow, another policy update... sure, this will totally fix server latency 🙄 #SarcasmCheck", "hinglish")
        ]

        for i, (text, lang) in enumerate(templates):
            yield RawPlatformEvent(
                platform="x",
                source_event_id=f"evt_x_{int(since.timestamp())}_{i}",
                source_user_id=f"usr_hash_{fake.hexify(text='^^^^^^^^')}",
                text=text,
                event_timestamp=since,
                conversation_id=f"conv_{i}",
                mentions=["@NTRO_India", "@CyberSecHQ"],
                hashtags=["#CyberSecurity", "#NTRO", "#SIH2026"],
                urls=["https://sih.gov.in/ps/26152"],
                engagement={"likes": fake.random_int(10, 500), "shares": fake.random_int(5, 100), "replies": fake.random_int(1, 50)},
                metadata={"lang": lang, "data_source": "synthetic"}
            )

    async def health_check(self) -> dict:
        return {
            "platform": "x",
            "status": "healthy",
            "provider": self.provider,
            "lag_seconds": 0.8,
            "rate_limit_usage_pct": 34
        }
