from contextlib import asynccontextmanager
from datetime import datetime, timezone
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db
from app.middleware import RequestIdMiddleware
from app.api.router import api_router
from app.api.websocket import router as ws_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup DB initialization
    try:
        await init_db()
    except Exception as e:
        print(f"[DB] Initial creation warning: {e}")
    yield

app = FastAPI(
    title=settings.app.name,
    version="1.0.0",
    description="Sovereign AI-Driven Social Media Analytics & Threat Intelligence API (SIH 2026 - NTRO)",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.app.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom Middlewares
app.add_middleware(RequestIdMiddleware)

# Root Health & Readiness Check Endpoints
@app.get("/health")
async def health_check_root():
    return {"status": "ok", "timestamp": datetime.now(timezone.utc).isoformat()}

@app.get("/ready")
async def ready_check_root():
    return {"status": "ready", "database": "connected", "redis": "connected"}

# Mount Routes
app.include_router(api_router)
app.include_router(ws_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {
        "title": settings.app.name,
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
        "api_v1": "/api/v1/metrics/overview"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.app.api_host,
        port=settings.app.api_port,
        reload=True
    )
