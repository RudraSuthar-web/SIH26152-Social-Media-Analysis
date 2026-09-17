import React from 'react';
import { CommunityCluster } from '../../types';
import { Layers } from 'lucide-react';

interface CommunityPanelProps {
  communities: CommunityCluster[];
}

export const CommunityPanel: React.FC<CommunityPanelProps> = ({ communities }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs font-mono text-slate-400">
        <span className="flex items-center gap-1.5 font-bold text-white">
          <Layers className="w-4 h-4 text-purple-400" /> Leiden Communities
        </span>
        <span>SOUL.md §16 Partitioning</span>
      </div>

      <div className="space-y-3">
        {communities.map((c) => (
          <div key={c.community_id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                <h4 className="text-xs font-bold text-white font-mono">{c.community_id}</h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                {c.node_count} Nodes
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {c.dominant_topics.map((t, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/40 text-cyan-300 border border-cyan-800/40"
                >
                  #{t}
                </span>
              ))}
            </div>

            <div className="text-[10px] font-mono text-slate-500 pt-1 flex items-center justify-between">
              <span>Modularity Q: {c.modularity.toFixed(2)}</span>
              <span>Min Cluster Size: N≥3</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
