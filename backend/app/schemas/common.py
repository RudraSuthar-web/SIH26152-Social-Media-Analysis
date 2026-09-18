from datetime import datetime, timezone
from typing import Generic, TypeVar, Optional, Literal
from pydantic import BaseModel, Field

T = TypeVar("T")

class TimeWindow(BaseModel):
    since: str
    until: str

class ApiMeta(BaseModel):
    request_id: str
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    data_source: Literal["live", "synthetic", "replay", "degraded", "offline"] = "synthetic"
    window: Optional[TimeWindow] = None
    model_version: Optional[str] = "v3.1 (ONNX)"
    processing_version: Optional[str] = "v2.0"

class ErrorDetail(BaseModel):
    code: str
    message: str
    details: Optional[dict] = None

class ApiResponse(BaseModel, Generic[T]):
    data: T
    meta: ApiMeta
    error: Optional[ErrorDetail] = None
