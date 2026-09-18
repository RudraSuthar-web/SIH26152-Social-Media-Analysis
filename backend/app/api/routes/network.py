from datetime import datetime, timezone
from fastapi import APIRouter, Request, Query
from app.schemas.common import ApiResponse, ApiMeta
from app.schemas.network import (
    NetworkNode, NetworkEdge, CommunityCluster, GraphData, CascadeNode, CentralityBucket
)

router = APIRouter(prefix="/network", tags=["Network Topology & Link Analysis Vector"])

MOCK_NODES: list[NetworkNode] = [
    NetworkNode(node_id="node_8f4a12", platform="x", source_user_id="usr_hash_a192f", avatar_color="#06b6d4", pagerank=0.0842, betweenness=0.1245, degree=48, community_id="c-01", post_count=184),
    NetworkNode(node_id="node_3b91e7", platform="telegram", source_user_id="usr_hash_b882c", avatar_color="#a855f7", pagerank=0.0612, betweenness=0.0982, degree=36, community_id="c-01", post_count=142),
    NetworkNode(node_id="node_c12a89", platform="x", source_user_id="usr_hash_c991d", avatar_color="#10b981", pagerank=0.0489, betweenness=0.0765, degree=29, community_id="c-02", post_count=98),
    NetworkNode(node_id="node_7d99a4", platform="telegram", source_user_id="usr_hash_d441e", avatar_color="#f59e0b", pagerank=0.0388, betweenness=0.0512, degree=22, community_id="c-02", post_count=76)
]

MOCK_EDGES: list[NetworkEdge] = [
    NetworkEdge(id="e-01", source_node_id="node_8f4a12", target_node_id="node_3b91e7", edge_type="repost", provenance="observed", weight=5.0, event_id="evt-1001"),
    NetworkEdge(id="e-02", source_node_id="node_3b91e7", target_node_id="node_c12a89", edge_type="mention", provenance="observed", weight=3.0, event_id="evt-1002"),
    NetworkEdge(id="e-03", source_node_id="node_c12a89", target_node_id="node_7d99a4", edge_type="topic_similarity", provenance="inferred", weight=2.5)
]

MOCK_COMMUNITIES: list[CommunityCluster] = [
    CommunityCluster(community_id="c-01", node_count=420, modularity=0.74, dominant_topics=["Cybersecurity", "NTRO AI"], color="#06b6d4"),
    CommunityCluster(community_id="c-02", node_count=280, modularity=0.68, dominant_topics=["Multilingual NLP", "Sarcasm"], color="#a855f7"),
    CommunityCluster(community_id="c-03", node_count=190, modularity=0.61, dominant_topics=["Telegram Threat Feeds"], color="#10b981")
]

MOCK_CASCADE = CascadeNode(
    id="casc-01",
    event_id="evt-1001",
    node_id="node_8f4a12",
    platform="x",
    timestamp=datetime.now(timezone.utc).isoformat(),
    depth=0,
    provenance="observed",
    children=[
        CascadeNode(
            id="casc-02",
            event_id="evt-1002",
            node_id="node_3b91e7",
            platform="telegram",
            timestamp=datetime.now(timezone.utc).isoformat(),
            depth=1,
            provenance="observed",
            children=[
                CascadeNode(
                    id="casc-03",
                    event_id="evt-1003",
                    node_id="node_c12a89",
                    platform="x",
                    timestamp=datetime.now(timezone.utc).isoformat(),
                    depth=2,
                    provenance="inferred"
                )
            ]
        )
    ]
)

@router.get("/graph", response_model=ApiResponse[GraphData])
async def get_network_graph(request: Request):
    req_id = getattr(request.state, "request_id", "req-graph")
    return ApiResponse(
        data=GraphData(nodes=MOCK_NODES, edges=MOCK_EDGES, communities=MOCK_COMMUNITIES),
        meta=ApiMeta(request_id=req_id, data_source="synthetic")
    )

@router.get("/kol", response_model=ApiResponse[list[NetworkNode]])
async def get_top_kols(request: Request):
    req_id = getattr(request.state, "request_id", "req-kol")
    return ApiResponse(
        data=sorted(MOCK_NODES, key=lambda n: n.pagerank, reverse=True),
        meta=ApiMeta(request_id=req_id, data_source="synthetic")
    )

@router.get("/communities", response_model=ApiResponse[list[CommunityCluster]])
async def get_communities(request: Request):
    req_id = getattr(request.state, "request_id", "req-communities")
    return ApiResponse(
        data=MOCK_COMMUNITIES,
        meta=ApiMeta(request_id=req_id, data_source="synthetic")
    )

@router.get("/propagation", response_model=ApiResponse[CascadeNode])
async def get_propagation_cascade(request: Request, topic_id: str = Query("t-101")):
    req_id = getattr(request.state, "request_id", "req-propagation")
    return ApiResponse(
        data=MOCK_CASCADE,
        meta=ApiMeta(request_id=req_id, data_source="synthetic")
    )

@router.get("/centrality-distribution", response_model=ApiResponse[list[CentralityBucket]])
async def get_centrality_distribution(request: Request):
    req_id = getattr(request.state, "request_id", "req-centrality")
    buckets = [
        CentralityBucket(bin="0.00 - 0.02", pagerankNodes=340, betweennessNodes=410, degreeNodes=280),
        CentralityBucket(bin="0.02 - 0.05", pagerankNodes=120, betweennessNodes=95, degreeNodes=140),
        CentralityBucket(bin="0.05 - 0.10", pagerankNodes=45, betweennessNodes=30, degreeNodes=60),
        CentralityBucket(bin="0.10 - 0.20", pagerankNodes=18, betweennessNodes=12, degreeNodes=25),
        CentralityBucket(bin="0.20+", pagerankNodes=5, betweennessNodes=3, degreeNodes=8)
    ]
    return ApiResponse(
        data=buckets,
        meta=ApiMeta(request_id=req_id, data_source="synthetic")
    )
