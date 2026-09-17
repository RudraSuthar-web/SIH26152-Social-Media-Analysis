import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { CascadeNode, ApiMeta } from '../types';
import { DataSourceBadge } from '../components/common/DataSourceBadge';
import { GitBranch, CornerDownRight, ShieldCheck, Share2 } from 'lucide-react';

export const PropagationPage: React.FC = () => {
  const [cascade, setCascade] = useState<CascadeNode | null>(null);
  const [meta, setMeta] = useState<ApiMeta | null>(null);

  useEffect(() => {
    apiService.getPropagationCascade().then((res) => {
      setCascade(res.data);
      setMeta(res.meta);
    });
  }, []);

  const renderCascadeTree = (node: CascadeNode) => {
    return (
      <div key={node.id} className="space-y-3 pl-4 border-l-2 border-slate-800 my-2">
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5 hover:border-cyan-500/40 transition-all font-mono text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CornerDownRight className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-bold text-white uppercase">{node.platform}</span>
              <span className="text-slate-400">Node: {node.node_id}</span>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              node.provenance === 'observed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
            }`}>
              {node.provenance.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span>Event ID: <strong className="text-slate-300">{node.event_id}</strong></span>
            <span>Depth Level: {node.depth}</span>
            <span>Time: {new Date(node.timestamp).toLocaleTimeString()}</span>
          </div>
        </div>

        {node.children && node.children.map(child => renderCascadeTree(child))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 panel-card p-5">
        <div>
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold font-mono text-white">Timeline & Information Propagation Vector</h2>
            {meta && <DataSourceBadge source={meta.data_source} />}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Reconstructing information cascades across sub-communities (SOUL.md §17 — observed vs inferred edges).
          </p>
        </div>

        <div className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
          Traceability: <span className="text-cyan-400 font-bold">SOUL.md §17 Standard</span>
        </div>
      </div>

      {/* Cascade Inspector */}
      <div className="panel-card p-6 space-y-4">
        <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
            <Share2 className="w-4 h-4 text-cyan-400" /> Propagation Cascade Tree
          </h3>
          <span className="text-xs font-mono text-slate-400">Target Narrative: NTRO AI Analytics Framework</span>
        </div>

        {cascade ? renderCascadeTree(cascade) : (
          <div className="p-8 text-center text-xs font-mono text-slate-500">Loading propagation cascade tree...</div>
        )}
      </div>
    </div>
  );
};
