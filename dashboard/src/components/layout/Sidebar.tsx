import React from 'react';
import { useAnalytics } from '../../context/AnalyticsContext';
import { LayoutDashboard, Smile, Users, TrendingUp, Network, Activity } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab } = useAnalytics();

  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      subtitle: 'Command Center',
      icon: <LayoutDashboard className="w-5 h-5" />
    },
    {
      id: 'sentiment',
      label: 'Sentiment & Emotion',
      subtitle: 'Vector 1 — Emotion & Code-Switch',
      icon: <Smile className="w-5 h-5" />
    },
    {
      id: 'demographics',
      label: 'Demographics',
      subtitle: 'Vector 2 — Aggregate Profiling',
      icon: <Users className="w-5 h-5" />
    },
    {
      id: 'trends',
      label: 'Trend Tracking',
      subtitle: 'Vector 3 — Velocity & Bot Burst',
      icon: <TrendingUp className="w-5 h-5" />
    },
    {
      id: 'network',
      label: 'Link & Network',
      subtitle: 'Vector 4 — Graph Topology & KOLs',
      icon: <Network className="w-5 h-5" />
    },
    {
      id: 'quality',
      label: 'Data Sentinel',
      subtitle: 'Telemetry & DLQ Quality',
      icon: <Activity className="w-5 h-5" />
    }
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between p-4 shrink-0 min-h-[calc(100vh-61px)]">
      <div className="space-y-1">
        <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500 px-3 mb-2 font-bold">
          ANALYTICAL VECTORS
        </p>

        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left group ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/15 to-blue-500/10 border border-cyan-500/30 text-white shadow-lg shadow-cyan-500/5'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
              }`}
            >
              <div
                className={`p-2 rounded-lg transition-colors ${
                  isActive ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-900 text-slate-400 group-hover:text-slate-200'
                }`}
              >
                {item.icon}
              </div>

              <div>
                <div className="text-xs font-bold tracking-wide">{item.label}</div>
                <div className="text-[10px] font-mono text-slate-500 tracking-tight">{item.subtitle}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* System Operational Info */}
      <div className="glass-panel p-3 border border-slate-800 rounded-xl bg-slate-900/50">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
          <span>PII Safeguard</span>
          <span className="text-emerald-400 font-bold">ENFORCED</span>
        </div>
        <p className="text-[10px] text-slate-500 leading-tight">
          Aggregate profiling & pseudonymous node hashing active per NTRO governance schema.
        </p>
      </div>
    </aside>
  );
};
