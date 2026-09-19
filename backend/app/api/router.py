from fastapi import APIRouter
from app.api.routes.events import router as events_router
from app.api.routes.sentiment import router as sentiment_router
from app.api.routes.demographics import router as demographics_router
from app.api.routes.trends import router as trends_router
from app.api.routes.network import router as network_router
from app.api.routes.health import router as health_router
from app.api.routes.admin import router as admin_router

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(events_router)
api_router.include_router(sentiment_router)
api_router.include_router(demographics_router)
api_router.include_router(trends_router)
api_router.include_router(network_router)
api_router.include_router(health_router)
api_router.include_router(admin_router, prefix="/admin", tags=["admin"])

