import asyncio
import logging
from sqlalchemy import select, func

from app.database import AsyncSessionLocal
from app.models.events import CanonicalEventModel
from app.ingestion.pipeline import pipeline
from app.workers.sentiment_worker import SentimentWorker
from app.workers.trends_worker import TrendsWorker
from app.workers.network_worker import NetworkWorker
from app.workers.demographics_worker import DemographicsWorker

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def run_seed_and_verification():
    logger.info("--- Starting SIH 2026 Sovereign Analytics Database Seed & Verification ---")

    # 1. Run Pipeline Ingestion for X and Telegram
    res_x = await pipeline.run_ingestion_job(platform="x", lookback_minutes=120)
    res_tg = await pipeline.run_ingestion_job(platform="telegram", lookback_minutes=120)

    logger.info(f"Ingested X events: {res_x['processed_count']}, Telegram events: {res_tg['processed_count']}")

    # 2. Verify Database Records in PostgreSQL
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(func.count(CanonicalEventModel.event_id)))
        total_count = result.scalar()
        logger.info(f"Total Canonical Events in PostgreSQL database: {total_count}")

        sample_stmt = select(CanonicalEventModel).limit(3)
        sample_res = await session.execute(sample_stmt)
        samples = sample_res.scalars().all()
        for s in samples:
            logger.info(f"  [DB Event] ID: {s.event_id} | Platform: {s.platform} | Node: {s.node_id} | Text: {s.text[:60]}...")

    # 3. Test Worker Execution
    test_events = [
        {"text": "Cyber threat alert for NTRO platform", "node_id": "node_8f4a12", "metadata": {"lang": "en"}, "mentions": ["@NTRO_India"]},
        {"text": "Gujarat tech hackathon SIH 2026 update", "node_id": "node_3b91e7", "metadata": {"lang": "gu"}, "mentions": []}
    ]

    sentiment_worker = SentimentWorker()
    trends_worker = TrendsWorker()
    network_worker = NetworkWorker()
    demographics_worker = DemographicsWorker()

    await sentiment_worker.process_batch(test_events)
    await trends_worker.process_batch(test_events)
    await network_worker.process_batch(test_events)
    await demographics_worker.process_batch(test_events)

    logger.info("Analytics Workers Health:")
    logger.info(f"  - Sentiment Worker: {sentiment_worker.get_health()}")
    logger.info(f"  - Trends Worker: {trends_worker.get_health()}")
    logger.info(f"  - Network Worker: {network_worker.get_health()}")
    logger.info(f"  - Demographics Worker: {demographics_worker.get_health()}")

    logger.info("--- Seed & Verification Successfully Completed! ---")

if __name__ == "__main__":
    asyncio.run(run_seed_and_verification())
