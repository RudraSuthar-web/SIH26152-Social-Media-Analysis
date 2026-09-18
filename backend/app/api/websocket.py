import asyncio
import json
from datetime import datetime, timezone
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter(tags=["WebSocket"])

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except Exception:
                pass

manager = ConnectionManager()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Send initial connection handshake
        await websocket.send_text(json.dumps({
            "topic": "system.alert",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "data": {"status": "connected", "message": "Real-time telemetry WebSocket active"}
        }))

        # Keep-alive heartbeat loop
        while True:
            await asyncio.sleep(15)
            await websocket.send_text(json.dumps({
                "topic": "ingestion.health",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "data": {"status": "healthy", "events_per_sec": 42}
            }))
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)
