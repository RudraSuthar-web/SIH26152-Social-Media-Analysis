import logging
import asyncio
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.ingestion.pipeline import pipeline

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()

async def scheduled_ingestion_job():
    logger.info("Executing periodic ingestion scheduler job...")
    try:
        await pipeline.run_ingestion_job(platform="x", lookback_minutes=30)
        await pipeline.run_ingestion_job(platform="telegram", lookback_minutes=30)
    except Exception as e:
        logger.error(f"Scheduled ingestion job error: {e}")

def start_scheduler():
    if not scheduler.running:
        scheduler.add_job(scheduled_ingestion_job, "interval", minutes=15, id="periodic_ingestion")
        scheduler.start()
        logger.info("APScheduler periodic ingestion scheduler started (interval=15m)")

def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown()
        logger.info("APScheduler scheduler stopped")
