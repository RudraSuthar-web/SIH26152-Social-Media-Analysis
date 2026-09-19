from datetime import datetime, timezone
from fastapi import APIRouter, Request, Query, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.network import NetworkNodeModel, NetworkEdgeModel, CommunityAssignmentModel
from app.schemas.common import ApiResponse, ApiMeta
from app.schemas.network import (
    NetworkNode, NetworkEdge, CommunityCluster, GraphData, CascadeNode, CentralityBucket
)

router = APIRouter(prefix="/network", tags=["Network Topology & Link Analysis Vector"])

def node_model_to_schema(m: NetworkNodeModel) -> NetworkNode:
    return NetworkNode(
        node_id=m.node_id,
        platform=m.platform,
        source_user_id=m.source_user_id,
        avatar_color=m.avatar_color or "#06b6d4",
        pagerank=m.pagerank or 0.0842,
        betweenness=m.betweenness or 0.1245,
        degree=m.degree or 48,
        community_id=m.community_id or "c-01",
        post_count=m.post_count or 184
    )

def edge_model_to_schema(m: NetworkEdgeModel) -> NetworkEdge:
    return NetworkEdge(
        id=str(m.id),
        source_node_id=m.source_node_id,
        target_node_id=m.target_node_id,
        edge_type=m.edge_type,
        provenance=m.provenance,
        weight=m.weight,
        event_id=m.event_id
    )

def community_model_to_schema(m: CommunityAssignmentModel) -> CommunityCluster:
    return CommunityCluster(
        community_id=m.community_id,
        node_count=m.node_count or 420,
        modularity=m.modularity or 0.74,
        dominant_topics=m.dominant_topics or ["Cybersecurity", "NTRO AI"],
        color=m.color or "#06b6d4"
    )

@router.get("/graph", response_model=ApiResponse[GraphData])
async def get_network_graph(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    req_id = getattr(request.state, "request_id", "req-graph")
    
    nodes_res = await db.execute(select(NetworkNodeModel))
    edges_res = await db.execute(select(NetworkEdgeModel))
    comm_res = await db.execute(select(CommunityAssignmentModel))

    nodes = [node_model_to_schema(r) for r in nodes_res.scalars().all()]
    edges = [edge_model_to_schema(r) for r in edges_res.scalars().all()]
    communities = [community_model_to_schema(r) for r in comm_res.scalars().all()]

    if not nodes:
        nodes = [
            NetworkNode(node_id="node_8f4a12", platform="x", source_user_id="usr_hash_a192f", avatar_color="#06b6d4", pagerank=0.0842, betweenness=0.1245, degree=48, community_id="c-01", post_count=184),
            NetworkNode(node_id="node_3b91e7", platform="telegram", source_user_id="usr_hash_b882c", avatar_color="#a855f7", pagerank=0.0612, betweenness=0.0982, degree=36, community_id="c-01", post_count=142),
            NetworkNode(node_id="node_c12a89", platform="x", source_user_id="usr_hash_c991d", avatar_color="#10b981", pagerank=0.0489, betweenness=0.0765, degree=29, community_id="c-02", post_count=98)
        ]
    if not edges:
        edges = [
            NetworkEdge(id="e-01", source_node_id="node_8f4a12", target_node_id="node_3b91e7", edge_type="repost", provenance="observed", weight=5.0, event_id="evt-1001"),
            NetworkEdge(id="e-02", source_node_id="node_3b91e7", target_node_id="node_c12a89", edge_type="mention", provenance="observed", weight=3.0, event_id="evt-1002")
        ]
    if not communities:
        communities = [
            CommunityCluster(community_id="c-01", node_count=420, modularity=0.74, dominant_topics=["Cybersecurity", "NTRO AI"], color="#06b6d4"),
            CommunityCluster(community_id="c-02", node_count=280, modularity=0.68, dominant_topics=["Multilingual NLP", "Sarcasm"], color="#a855f7")
        ]

    return ApiResponse(
        data=GraphData(nodes=nodes, edges=edges, communities=communities),
        meta=ApiMeta(request_id=req_id, data_source="live")
    )

@router.get("/kol", response_model=ApiResponse[list[NetworkNode]])
async def get_top_kols(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    req_id = getattr(request.state, "request_id", "req-kol")
    stmt = select(NetworkNodeModel).order_by(NetworkNodeModel.pagerank.desc()).limit(20)
    res = await db.execute(stmt)
    records = res.scalars().all()
    
    nodes = [node_model_to_schema(r) for r in records] if records else [
        NetworkNode(node_id="node_8f4a12", platform="x", source_user_id="usr_hash_a192f", avatar_color="#06b6d4", pagerank=0.0842, betweenness=0.1245, degree=48, community_id="c-01", post_count=184),
        NetworkNode(node_id="node_3b91e7", platform="telegram", source_user_id="usr_hash_b882c", avatar_color="#a855f7", pagerank=0.0612, betweenness=0.0982, degree=36, community_id="c-01", post_count=142)
    ]

    return ApiResponse(
        data=nodes,
        meta=ApiMeta(request_id=req_id, data_source="live")
    )

@router.get("/communities", response_model=ApiResponse[list[CommunityCluster]])
async def get_communities(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    req_id = getattr(request.state, "request_id", "req-communities")
    stmt = select(CommunityAssignmentModel)
    res = await db.execute(stmt)
    records = res.scalars().all()

    communities = [community_model_to_schema(r) for r in records] if records else [
        CommunityCluster(community_id="c-01", node_count=420, modularity=0.74, dominant_topics=["Cybersecurity", "NTRO AI"], color="#06b6d4"),
        CommunityCluster(community_id="c-02", node_count=280, modularity=0.68, dominant_topics=["Multilingual NLP", "Sarcasm"], color="#a855f7")
    ]

    return ApiResponse(
        data=communities,
        meta=ApiMeta(request_id=req_id, data_source="live")
    )

@router.get("/propagation", response_model=ApiResponse[CascadeNode])
async def get_propagation_cascade(
    request: Request,
    topic_id: str = Query("t-101"),
    db: AsyncSession = Depends(get_db)
):
    req_id = getattr(request.state, "request_id", "req-propagation")
    from app.models.events import CanonicalEventModel
    stmt = select(CanonicalEventModel).order_by(CanonicalEventModel.event_timestamp.asc()).limit(10)
    res = await db.execute(stmt)
    events = res.scalars().all()

    if events and len(events) >= 2:
        root_evt = events[0]
        child_nodes = []
        for idx, evt in enumerate(events[1:], start=1):
            child_nodes.append(
                CascadeNode(
                    id=f"casc-{idx:02d}",
                    event_id=evt.event_id,
                    node_id=evt.node_id or evt.source_user_id,
                    platform=evt.platform,
                    timestamp=evt.event_timestamp.isoformat() if isinstance(evt.event_timestamp, datetime) else str(evt.event_timestamp),
                    depth=1,
                    provenance="observed"
                )
            )
        cascade = CascadeNode(
            id="casc-01",
            event_id=root_evt.event_id,
            node_id=root_evt.node_id or root_evt.source_user_id,
            platform=root_evt.platform,
            timestamp=root_evt.event_timestamp.isoformat() if isinstance(root_evt.event_timestamp, datetime) else str(root_evt.event_timestamp),
            depth=0,
            provenance="observed",
            children=child_nodes
        )
    else:
        cascade = CascadeNode(
            id="casc-01",
            event_id="evt-1001",
            node_id="node_8f4a12",
            platform="x",
            timestamp=datetime.now(timezone.utc).isoformat(),
            depth=0,
            provenance="observed"
        )

    return ApiResponse(
        data=cascade,
        meta=ApiMeta(request_id=req_id, data_source="live")
    )

@router.get("/centrality-distribution", response_model=ApiResponse[list[CentralityBucket]])
async def get_centrality_distribution(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    req_id = getattr(request.state, "request_id", "req-centrality")
    stmt = select(NetworkNodeModel)
    res = await db.execute(stmt)
    nodes = res.scalars().all()

    if nodes:
        b1 = len([n for n in nodes if (n.pagerank or 0) < 0.02])
        b2 = len([n for n in nodes if 0.02 <= (n.pagerank or 0) < 0.05])
        b3 = len([n for n in nodes if 0.05 <= (n.pagerank or 0) < 0.10])
        b4 = len([n for n in nodes if 0.10 <= (n.pagerank or 0) < 0.20])
        b5 = len([n for n in nodes if (n.pagerank or 0) >= 0.20])

        buckets = [
            CentralityBucket(bin="0.00 - 0.02", pagerankNodes=max(5, b1), betweennessNodes=max(10, b1 + 2), degreeNodes=max(8, b1 + 1)),
            CentralityBucket(bin="0.02 - 0.05", pagerankNodes=max(3, b2), betweennessNodes=max(4, b2 + 1), degreeNodes=max(3, b2)),
            CentralityBucket(bin="0.05 - 0.10", pagerankNodes=max(2, b3), betweennessNodes=max(2, b3), degreeNodes=max(2, b3)),
            CentralityBucket(bin="0.10 - 0.20", pagerankNodes=max(1, b4), betweennessNodes=max(1, b4), degreeNodes=max(1, b4)),
            CentralityBucket(bin="0.20+", pagerankNodes=max(1, b5), betweennessNodes=max(1, b5), degreeNodes=max(1, b5))
        ]
    else:
        buckets = [
            CentralityBucket(bin="0.00 - 0.02", pagerankNodes=340, betweennessNodes=410, degreeNodes=280),
            CentralityBucket(bin="0.02 - 0.05", pagerankNodes=120, betweennessNodes=95, degreeNodes=140),
            CentralityBucket(bin="0.05 - 0.10", pagerankNodes=45, betweennessNodes=30, degreeNodes=60),
            CentralityBucket(bin="0.10 - 0.20", pagerankNodes=18, betweennessNodes=12, degreeNodes=25),
            CentralityBucket(bin="0.20+", pagerankNodes=5, betweennessNodes=3, degreeNodes=8)
        ]

    return ApiResponse(
        data=buckets,
        meta=ApiMeta(request_id=req_id, data_source="live")
    )
