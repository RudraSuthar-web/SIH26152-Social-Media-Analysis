import React from 'react';
import { useAnalytics } from '../../context/AnalyticsContext';
import { PlatformType } from '../../types';

export const PlatformFilter: React.FC = () => {
  const { selectedPlatform, setSelectedPlatform } = useAnalytics();

  const platforms: { value: PlatformType; label: string; badgeColor: string }[] = [
    { value: 'all', label: 'All Sources', badgeColor: 'bg-slate-700' },
    { value: 'x', label: 'X (Twitter)', badgeColor: 'bg-sky-500' },
    { value: 'telegram', label: 'Telegram', badgeColor: 'bg-blue-500' },
    { value: 'reddit', label: 'Reddit', badgeColor: 'bg-orange-500' },
    { value: 'youtube', label: 'YouTube', badgeColor: 'bg-red-500' }
  ];

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {platforms.map((p) => (
        <button
          key={p.value}
          onClick={() => setSelectedPlatform(p.value)}
          className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 ${
            selectedPlatform === p.value
              ? 'bg-slate-800 text-white border-cyan-500/50 shadow-sm shadow-cyan-500/20'
              : 'bg-slate-900/50 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800/80'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${p.badgeColor}`} />
          {p.label}
        </button>
      ))}
    </div>
  );
};
