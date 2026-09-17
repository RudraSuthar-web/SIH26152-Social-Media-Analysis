import React from 'react';
import { useAnalytics } from '../../context/AnalyticsContext';
import { DateRangePicker } from '../common/DateRangePicker';
import {
  RefreshCw,
  Search,
  LayoutDashboard,
  Smile,
  Users,
  TrendingUp,
  Network,
  GitBranch,
  Cpu,
  Activity
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    refreshData
  } = useAnalytics();

  const navTabs = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    { id: 'sentiment', label: 'Sentiment & Emotion', icon: <Smile className="w-3.5 h-3.5" /> },
    { id: 'demographics', label: 'Demographics', icon: <Users className="w-3.5 h-3.5" /> },
    { id: 'trends', label: 'Trend Tracking', icon: <TrendingUp className="w-3.5 h-3.5" /> },
    { id: 'network', label: 'Link & Network', icon: <Network className="w-3.5 h-3.5" /> },
    { id: 'propagation', label: 'Propagation', icon: <GitBranch className="w-3.5 h-3.5" /> },
    { id: 'evaluation', label: 'Model Eval', icon: <Cpu className="w-3.5 h-3.5" /> },
    { id: 'quality', label: 'Data Sentinel', icon: <Activity className="w-3.5 h-3.5" /> }
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0d1222]/95 backdrop-blur-md border-b border-slate-800/80 px-6 py-3.5 space-y-3">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Top Left Brand & Platform Icons */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-full bg-[#1da1f2] flex items-center justify-center font-extrabold text-white text-[11px] shadow">X</div>
            <div className="w-7 h-7 rounded-full bg-[#229ed9] flex items-center justify-center font-extrabold text-white text-[11px] shadow">TG</div>
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-white font-sans">
              NTRO Social Media Intelligence
            </h1>
            <p className="text-[11px] text-cyan-400 font-mono">
              PS 26152 • National Technical Research Organisation • SIH 2026
            </p>
          </div>
        </div>

        {/* Top Right Date Range & Sync Controls */}
        <div className="flex items-center gap-3">
          <DateRangePicker />

          <button
            onClick={refreshData}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs & Search */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
        <nav className="flex items-center gap-1.5 overflow-x-auto">
          {navTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Search Input */}
        <div className="relative hidden md:block w-48">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search intel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 transition-colors"
          />
        </div>
      </div>
    </header>
  );
};
