from fastapi import APIRouter, Request
from app.schemas.common import ApiResponse, ApiMeta
from app.schemas.demographics import DemographicAggregate, GeographyData

router = APIRouter(prefix="/demographics", tags=["Demographics Vector"])

@router.get("", response_model=ApiResponse[DemographicAggregate])
async def get_demographics(request: Request):
    req_id = getattr(request.state, "request_id", "req-demographics")
    aggregate = DemographicAggregate(
        window="24h",
        topic="Sovereign AI Social Media Analytics",
        sample_size=18450,
        confidence_label="inferred",
        age_brackets={
            "13-17": 0.12,
            "18-25": 0.38,
            "26-35": 0.32,
            "36-50": 0.12,
            "50+": 0.06
        },
        age_confidence_intervals={
            "13-17": [0.10, 0.14],
            "18-25": [0.35, 0.41],
            "26-35": [0.29, 0.35],
            "36-50": [0.10, 0.14],
            "50+": [0.04, 0.08]
        },
        languages={
            "English": 0.42,
            "Hindi": 0.31,
            "Hinglish": 0.15,
            "Bengali": 0.07,
            "Punjabi": 0.05
        },
        geography={
            "Delhi NCR": 0.32,
            "Maharashtra": 0.24,
            "Karnataka": 0.18,
            "West Bengal": 0.14,
            "Gujarat": 0.12
        },
        interests={
            "Cyber Security": 0.45,
            "AI & Governance": 0.28,
            "Public Policy": 0.15,
            "Defense Tech": 0.12
        },
        methodology_notes=[
            "Privacy by Design (SOUL.md §12): Raw PII is completely deleted at ingestion normalization stage.",
            "Inferred age brackets are derived from linguistic complexity, active hours, and bio metadata heuristics.",
            "Aggregate geofence distributions represent PostGIS spatial density clusters."
        ]
    )
    return ApiResponse(
        data=aggregate,
        meta=ApiMeta(request_id=req_id, data_source="synthetic")
    )

@router.get("/geography", response_model=ApiResponse[GeographyData])
async def get_geography(request: Request):
    req_id = getattr(request.state, "request_id", "req-geography")
    data = GeographyData(
        regions={
            "Delhi NCR": 0.32,
            "Maharashtra": 0.24,
            "Karnataka": 0.18,
            "West Bengal": 0.14,
            "Gujarat": 0.12
        }
    )
    return ApiResponse(
        data=data,
        meta=ApiMeta(request_id=req_id, data_source="synthetic")
    )
