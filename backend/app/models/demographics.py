from datetime import datetime, timezone
from sqlalchemy import String, Integer, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base

class DemographicAggregateModel(Base):
    __tablename__ = "demographic_aggregates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    window: Mapped[str] = mapped_column(String(32), default="24h")
    topic: Mapped[str] = mapped_column(String(256), nullable=False)
    sample_size: Mapped[int] = mapped_column(Integer, default=0)
    confidence_label: Mapped[str] = mapped_column(String(16), default="inferred")
    age_brackets: Mapped[dict] = mapped_column(JSON, default=dict)
    age_confidence_intervals: Mapped[dict] = mapped_column(JSON, default=dict)
    languages: Mapped[dict] = mapped_column(JSON, default=dict)
    geography: Mapped[dict] = mapped_column(JSON, default=dict)
    interests: Mapped[dict] = mapped_column(JSON, default=dict)
    methodology_notes: Mapped[dict] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
