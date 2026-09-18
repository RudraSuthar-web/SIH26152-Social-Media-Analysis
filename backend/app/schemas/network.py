from typing import Optional, Literal
from pydantic import BaseModel, Field

class NetworkNode(BaseModel):
    node_id: str
    platform: str
    source_user_id: str
    avatar_color: str = "#06b6d4"
    pagerank: float
    betweenness: float
    degree: int
    community_id: str
    post_count: int

class NetworkEdge(BaseModel):
    id: str
    source_node_id: str
    target_node_id: str
    edge_type: Literal["mention", "reply", "repost", "forward", "quote", "topic_similarity"]
    provenance: Literal["observed", "inferred"]
    weight: float
    event_id: Optional[str] = None

class CommunityCluster(BaseModel):
    community_id: str
    node_count: int
    modularity: float
    dominant_topics: list[str] = Field(default_factory=list)
    color: str = "#06b6d4"

class GraphData(BaseModel):
    nodes: list[NetworkNode]
    edges: list[NetworkEdge]
    communities: list[CommunityCluster]

class CascadeNode(BaseModel):
    id: str
    event_id: str
    node_id: str
    platform: str
    timestamp: str
    depth: int
    provenance: Literal["observed", "inferred"]
    children: Optional[list["CascadeNode"]] = None

class CentralityBucket(BaseModel):
    bin: str
    pagerankNodes: int
    betweennessNodes: int
    degreeNodes: int
