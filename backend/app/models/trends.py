from datetime import datetime, timezone
from sqlalchemy import String, Float, Boolean, DateTime, JSON, Integer
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base

class TrendWindowModel(Base):
    __tablename__ = "trend_windows"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    topic_id: Mapped[str] = mapped_column(String(64), nullable=False)
    topic_label: Mapped[str] = mapped_column(String(256), nullable=False)
    keywords: Mapped[dict] = mapped_column(JSON, default=list)
    hashtags: Mapped[dict] = mapped_column(JSON, default=list)
    volume: Mapped[int] = mapped_column(Integer, default=0)
    unique_users: Mapped[int] = mapped_column(Integer, default=0)
    growth_rate: Mapped[float] = mapped_column(Float, default=0.0)
    velocity: Mapped[float] = mapped_column(Float, default=0.0)
    momentum: Mapped[float] = mapped_column(Float, default=0.0)
    trend_score: Mapped[float] = mapped_column(Float, default=0.0)
    platforms: Mapped[dict] = mapped_column(JSON, default=list)
    languages: Mapped[dict] = mapped_column(JSON, default=list)
    coordinated_pattern: Mapped[bool] = mapped_column(Boolean, default=False)
    components: Mapped[dict] = mapped_column(JSON, default=dict)
    sparkline: Mapped[dict] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
