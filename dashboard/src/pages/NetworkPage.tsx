import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { NetworkNode, NetworkEdge, CommunityCluster, ApiMeta } from '../types';
import { NetworkGraph } from '../components/network/NetworkGraph';
import { KOLTable } from '../components/network/KOLTable';
import { CommunityPanel } from '../components/network/CommunityPanel';
import { CentralityDistribution } from '../components/charts/network/CentralityDistribution';
import { CommunityTreemap } from '../components/charts/network/CommunityTreemap';
import { DataSourceBadge } from '../components/common/DataSourceBadge';
import { CsvExportButton } from '../components/common/CsvExportButton';
import { Modal } from '../components/common/Modal';
import { Network, Share2, Layers, Cpu, Hash } from 'lucide-react';

export const NetworkPage: React.FC = () => {
  const [nodes, setNodes] = useState<NetworkNode[]>([]);
  const [edges, setEdges] = useState<NetworkEdge[]>([]);
  const [communities, setCommunities] = useState<CommunityCluster[]>([]);
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [meta, setMeta] = useState<ApiMeta | null>(null);

  useEffect(() => {
    apiService.getNetworkGraph().then((res) => {
      setNodes(res.data.nodes);
      setEdges(res.data.edges);
      setCommunities(res.data.communities);
      setMeta(res.meta);
    });
  }, []);

  return (
    <div className="space-y-6" role="region" aria-label="Network Topology Vector">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 panel-card p-5">
        <div>
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold font-mono text-white">Link & Network Topology Vector</h2>
            {meta && <DataSourceBadge source={meta.data_source} />}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Graph analysis, PageRank centrality vectors, Leiden community detection, and observed vs inferred edges (SOUL.md §14-16).
          </p>
        </div>

        <div className="flex items-center gap-3">
          {meta && <CsvExportButton data={nodes} filename="network_nodes_pagerank" meta={meta} />}

          <div className="flex items-center gap-2 text-xs font-mono text-slate-300 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            <Cpu className="w-4 h-4 text-purple-400" />
            <span>Nodes: <strong className="text-white">{nodes.length}</strong></span>
            <span className="text-slate-500">•</span>
            <span>Edges: <strong className="text-cyan-400">{edges.length}</strong></span>
          </div>
        </div>
      </div>

      {/* Main Graph & Communities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Graph */}
        <div className="lg:col-span-2 panel-card p-5 space-y-4">
          <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
              <Share2 className="w-4 h-4 text-cyan-400" /> Pseudonymized Network Graph (PageRank Vector Sizing)
            </h3>
            <span className="text-[11px] font-mono text-slate-400">SOUL.md §13 Pseudonymity Active</span>
          </div>

          <NetworkGraph
            nodes={nodes}
            edges={edges}
            communities={communities}
            onSelectNode={(n) => setSelectedNode(n)}
          />
        </div>

        {/* Communities Column */}
        <div className="panel-card p-5 space-y-4">
          <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" /> Leiden Community Partitioning
            </h3>
          </div>

          <CommunityPanel communities={communities} />
        </div>
      </div>

      {/* Expanded Charts Row (CHART_EXPANSION.md) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CentralityDistribution requestId={meta?.request_id} />
        <CommunityTreemap communities={communities} requestId={meta?.request_id} />
      </div>

      {/* KOL Leaderboard Table */}
      <KOLTable nodes={nodes} onSelectNode={(n) => setSelectedNode(n)} />

      {/* Node Inspector Modal */}
      {selectedNode && (
        <Modal
          isOpen={!!selectedNode}
          onClose={() => setSelectedNode(null)}
          title={`Entity Node Profile: ${selectedNode.node_id}`}
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between font-mono text-xs">
              <div>
                <span className="text-slate-400">Internal Node ID:</span>
                <p className="text-sm font-bold text-white mt-0.5">{selectedNode.node_id}</p>
              </div>
              <span className="px-2.5 py-1 rounded bg-slate-900 text-cyan-400 border border-slate-800 font-bold">
                Community: {selectedNode.community_id}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-400">PageRank Vector:</span>
                <p className="text-lg font-bold text-cyan-400 mt-1">{selectedNode.pagerank.toFixed(4)}</p>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-400">Betweenness:</span>
                <p className="text-lg font-bold text-emerald-400 mt-1">{selectedNode.betweenness.toFixed(4)}</p>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-400">Degree:</span>
                <p className="text-lg font-bold text-purple-400 mt-1">{selectedNode.degree}</p>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono text-slate-400 space-y-1">
              <div className="flex items-center gap-1 font-bold text-white mb-1">
                <Hash className="w-3.5 h-3.5 text-cyan-400" /> Pseudonymity Provenance Safeguard
              </div>
              <p>Internal Source User Hash: <span className="text-slate-300">{selectedNode.source_user_id}</span></p>
              <p>SOUL.md §13: Pseudonymized internal identifiers active. Raw handles not exposed.</p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
