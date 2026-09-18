from typing import Optional, Literal
from pydantic import BaseModel, Field

class DemographicAggregate(BaseModel):
    window: str
    topic: str
    sample_size: int
    confidence_label: Literal["estimated", "inferred", "uncertain"]
    age_brackets: dict[str, float]
    age_confidence_intervals: Optional[dict[str, list[float]]] = None
    languages: dict[str, float]
    geography: dict[str, float]
    interests: dict[str, float]
    methodology_notes: list[str] = Field(default_factory=list)

class GeographyData(BaseModel):
    regions: dict[str, float]
