import React from 'react';
import { NetworkNode } from '../../types';
import { Award, Share2 } from 'lucide-react';

interface KOLTableProps {
  nodes: NetworkNode[];
  onSelectNode?: (node: NetworkNode) => void;
}

export const KOLTable: React.FC<KOLTableProps> = ({ nodes, onSelectNode }) => {
  const sorted = [...nodes].sort((a, b) => b.pagerank - a.pagerank);

  return (
    <div className="panel-card overflow-hidden">
      <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
        <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
          <Award className="w-4 h-4 text-cyan-400" /> Key Opinion Leaders (KOLs) — PageRank Vector
        </h3>
        <span className="text-xs font-mono text-slate-400">SOUL.md §15 Influencer Vector</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-800">
            <tr>
              <th className="px-4 py-2.5">Rank</th>
              <th className="px-4 py-2.5">Pseudonymous Node ID</th>
              <th className="px-4 py-2.5">Platform</th>
              <th className="px-4 py-2.5 text-right">PageRank</th>
              <th className="px-4 py-2.5 text-right">Betweenness</th>
              <th className="px-4 py-2.5 text-right">Degree</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {sorted.map((node, i) => (
              <tr
                key={node.node_id}
                onClick={() => onSelectNode && onSelectNode(node)}
                className="hover:bg-slate-900/60 transition-colors cursor-pointer"
              >
                <td className="px-4 py-3 font-bold text-slate-400">#{i + 1}</td>
                <td className="px-4 py-3 font-semibold text-white flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: node.avatar_color }}
                  />
                  {node.node_id}
                </td>
                <td className="px-4 py-3 uppercase text-slate-400">{node.platform}</td>
                <td className="px-4 py-3 text-right font-bold text-cyan-400">
                  {node.pagerank.toFixed(4)}
                </td>
                <td className="px-4 py-3 text-right text-slate-300">
                  {node.betweenness.toFixed(4)}
                </td>
                <td className="px-4 py-3 text-right text-slate-400 flex items-center justify-end gap-1">
                  <Share2 className="w-3 h-3 text-slate-500" />
                  {node.degree}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
