import React from 'react';

interface BarChartProps {
  data: Record<string, number>;
  colorScheme?: 'blue' | 'emerald' | 'amber' | 'purple';
}

export const BarChart: React.FC<BarChartProps> = ({ data, colorScheme = 'blue' }) => {
  const entries = Object.entries(data);

  const getBarColor = () => {
    switch (colorScheme) {
      case 'emerald': return 'bg-emerald-500/80 hover:bg-emerald-400';
      case 'amber': return 'bg-amber-500/80 hover:bg-amber-400';
      case 'purple': return 'bg-purple-500/80 hover:bg-purple-400';
      default: return 'bg-cyan-500/80 hover:bg-cyan-400';
    }
  };

  return (
    <div className="space-y-3">
      {entries.map(([label, ratio]) => {
        const pct = Math.round(ratio * 100);
        return (
          <div key={label} className="space-y-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">{label}</span>
              <span className="text-slate-400 font-bold">{pct}%</span>
            </div>
            <div className="h-3 bg-slate-900 rounded-lg overflow-hidden border border-slate-800">
              <div
                className={`h-full ${getBarColor()} transition-all duration-500 rounded-lg`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
