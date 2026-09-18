import React from 'react';
import { ChartContainer } from '../ChartContainer';
import { CommunityCluster } from '../../../types';

interface Props {
  communities?: CommunityCluster[];
  requestId?: string;
}

const defaultCommunities: CommunityCluster[] = [
  { community_id: 'c-01', node_count: 420, modularity: 0.74, dominant_topics: ['Cybersecurity', 'NTRO AI'], color: '#06b6d4' },
  { community_id: 'c-02', node_count: 280, modularity: 0.68, dominant_topics: ['Multilingual NLP', 'Sarcasm'], color: '#a855f7' },
  { community_id: 'c-03', node_count: 190, modularity: 0.61, dominant_topics: ['Telegram Threat Feeds'], color: '#10b981' },
  { community_id: 'c-04', node_count: 110, modularity: 0.55, dominant_topics: ['PostGIS Geofencing'], color: '#f59e0b' }
];

export const CommunityTreemap: React.FC<Props> = ({ communities = defaultCommunities, requestId = 'req-community-tree' }) => {
  const totalNodes = communities.reduce((acc, c) => acc + c.node_count, 0);

  return (
    <ChartContainer
      title="Leiden Community Partitioning Volume Treemap"
      subtitle="SOUL.md §16: Relative size & modularity density per community partition"
      requestId={requestId}
      exportFilename="community_partitioning_treemap"
      exportData={communities}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
        {communities.map((comm) => {
          const sharePct = Math.round((comm.node_count / totalNodes) * 100);
          return (
            <div
              key={comm.community_id}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 hover:border-cyan-500/40 transition-all"
              style={{ borderLeft: `4px solid ${comm.color}` }}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white uppercase">{comm.community_id}</span>
                <span className="text-[11px] font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                  {sharePct}% Share
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Node Count: <strong className="text-slate-200">{comm.node_count}</strong></span>
                <span>Modularity: <strong className="text-purple-400">{comm.modularity.toFixed(2)}</strong></span>
              </div>

              <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-1">
                {comm.dominant_topics.map((topic, i) => (
                  <span key={i} className="text-[10px] bg-slate-950 text-slate-300 px-2 py-0.5 rounded border border-slate-800">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </ChartContainer>
  );
};
