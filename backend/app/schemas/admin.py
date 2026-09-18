from datetime import datetime
from pydantic import BaseModel

class BackfillRequest(BaseModel):
    platform: str
    since: str
    until: str

class BackfillJobResponse(BaseModel):
    job_id: str
    platform: str
    status: str
    scheduled_at: str
