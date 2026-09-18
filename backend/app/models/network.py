from datetime import datetime, timezone
from sqlalchemy import String, Float, DateTime, JSON, Integer
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base

class NetworkNodeModel(Base):
    __tablename__ = "network_nodes"

    node_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    platform: Mapped[str] = mapped_column(String(32), nullable=False)
    source_user_id: Mapped[str] = mapped_column(String(128), nullable=False)
    avatar_color: Mapped[str] = mapped_column(String(16), default="#06b6d4")
    pagerank: Mapped[float] = mapped_column(Float, default=0.0)
    betweenness: Mapped[float] = mapped_column(Float, default=0.0)
    degree: Mapped[int] = mapped_column(Integer, default=0)
    community_id: Mapped[str] = mapped_column(String(64), nullable=False)
    post_count: Mapped[int] = mapped_column(Integer, default=0)

class NetworkEdgeModel(Base):
    __tablename__ = "network_edges"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    source_node_id: Mapped[str] = mapped_column(String(64), nullable=False)
    target_node_id: Mapped[str] = mapped_column(String(64), nullable=False)
    edge_type: Mapped[str] = mapped_column(String(32), nullable=False)
    provenance: Mapped[str] = mapped_column(String(16), default="observed")
    weight: Mapped[float] = mapped_column(Float, default=1.0)
    event_id: Mapped[str] = mapped_column(String(64), nullable=True)

class CommunityAssignmentModel(Base):
    __tablename__ = "community_assignments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    community_id: Mapped[str] = mapped_column(String(64), nullable=False)
    node_count: Mapped[int] = mapped_column(Integer, default=0)
    modularity: Mapped[float] = mapped_column(Float, default=0.0)
    dominant_topics: Mapped[dict] = mapped_column(JSON, default=list)
    color: Mapped[str] = mapped_column(String(16), default="#06b6d4")
