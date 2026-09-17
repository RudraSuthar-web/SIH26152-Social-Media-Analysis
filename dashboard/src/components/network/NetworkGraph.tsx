import React, { useState } from 'react';
import { NetworkNode, NetworkEdge, CommunityCluster } from '../../types';

interface NetworkGraphProps {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  communities: CommunityCluster[];
  onSelectNode?: (node: NetworkNode) => void;
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({
  nodes,
  edges,
  communities,
  onSelectNode
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const width = 650;
  const height = 380;
  const cx = width / 2;
  const cy = height / 2;

  const nodePositions: Record<string, { x: number; y: number }> = {};
  const commCenters: Record<string, { x: number; y: number }> = {
    'comm-alpha': { x: cx - 140, y: cy - 60 },
    'comm-beta': { x: cx + 140, y: cy - 40 },
    'comm-gamma': { x: cx, y: cy + 110 }
  };

  nodes.forEach((n, idx) => {
    const center = commCenters[n.community_id] || { x: cx, y: cy };
    const angle = (idx * 2.1) % (2 * Math.PI);
    const radius = 45 + (idx % 3) * 20;
    nodePositions[n.node_id] = {
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius
    };
  });

  const getCommunityColor = (commId: string) => {
    const c = communities.find(comm => comm.community_id === commId);
    return c ? c.color : '#38bdf8';
  };

  const handleNodeClick = (node: NetworkNode) => {
    setSelectedNodeId(node.node_id);
    if (onSelectNode) onSelectNode(node);
  };

  return (
    <div className="w-full relative bg-slate-950 rounded-xl border border-slate-800 overflow-hidden p-2">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <defs>
          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#1e293b" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width={width} height={height} fill="url(#grid)" />

        {/* Edges with Provenance Encoding (Observed = Solid, Inferred = Dashed) */}
        {edges.map((e) => {
          const sourcePos = nodePositions[e.source_node_id];
          const targetPos = nodePositions[e.target_node_id];
          if (!sourcePos || !targetPos) return null;

          const isSelected = selectedNodeId === e.source_node_id || selectedNodeId === e.target_node_id;
          const isObserved = e.provenance === 'observed';

          return (
            <line
              key={e.id}
              x1={sourcePos.x}
              y1={sourcePos.y}
              x2={targetPos.x}
              y2={targetPos.y}
              stroke={isSelected ? '#38bdf8' : isObserved ? '#334155' : '#a855f7'}
              strokeWidth={isSelected ? 2.5 : 1.2}
              strokeDasharray={isObserved ? undefined : '4 4'}
              opacity={isSelected ? 1 : 0.6}
            />
          );
        })}

        {/* Pseudonymized Nodes */}
        {nodes.map((n) => {
          const pos = nodePositions[n.node_id];
          if (!pos) return null;

          const r = Math.max(10, Math.min(24, n.pagerank * 200));
          const color = getCommunityColor(n.community_id);
          const isSelected = selectedNodeId === n.node_id;

          return (
            <g
              key={n.node_id}
              transform={`translate(${pos.x}, ${pos.y})`}
              onClick={() => handleNodeClick(n)}
              className="cursor-pointer group"
            >
              <circle
                r={r + (isSelected ? 6 : 0)}
                fill={color}
                fillOpacity={isSelected ? 0.9 : 0.7}
                stroke={isSelected ? '#ffffff' : color}
                strokeWidth={isSelected ? 3 : 1.5}
                className="transition-all duration-200"
              />
              <text
                y={r + 14}
                fill="#94a3b8"
                fontSize="9"
                fontFamily="JetBrains Mono"
                textAnchor="middle"
                className="pointer-events-none group-hover:fill-cyan-400 font-bold"
              >
                {n.node_id}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Provenance Visual Key */}
      <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-800 backdrop-blur p-2 rounded-lg text-[10px] font-mono flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-slate-500 inline-block" />
          <span className="text-slate-300">Observed Interaction</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-purple-500 inline-block border-t border-dashed" />
          <span className="text-slate-300">Inferred Similarity</span>
        </div>
      </div>
    </div>
  );
};
