import React from 'react';

interface BarChartProps {
  data: Record<string, number>;
  colorScheme?: 'blue' | 'emerald' | 'amber' | 'purple';
  confidenceIntervals?: Record<string, [number, number]>;
}

export const BarChart: React.FC<BarChartProps> = ({ data, colorScheme = 'blue', confidenceIntervals }) => {
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
        const ci = confidenceIntervals ? confidenceIntervals[label] : null;
        const ciLow = ci ? Math.max(0, Math.round(ci[0] * 100)) : null;
        const ciHigh = ci ? Math.min(100, Math.round(ci[1] * 100)) : null;

        return (
          <div key={label} className="space-y-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">{label}</span>
              <span className="text-slate-400 font-bold">
                {pct}%
                {ciLow !== null && ciHigh !== null && (
                  <span className="text-[10px] text-cyan-400 ml-1.5 font-normal">
                    (CI: {ciLow}% - {ciHigh}%)
                  </span>
                )}
              </span>
            </div>
            <div className="h-3.5 bg-slate-900 rounded-lg overflow-hidden border border-slate-800 relative">
              <div
                className={`h-full ${getBarColor()} transition-all duration-500 rounded-lg`}
                style={{ width: `${pct}%` }}
              />

              {/* Confidence Interval Error Whisker Bar */}
              {ciLow !== null && ciHigh !== null && (
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-1.5 bg-amber-400/90 rounded-sm pointer-events-none z-10 shadow-sm"
                  style={{
                    left: `${ciLow}%`,
                    width: `${Math.max(2, ciHigh - ciLow)}%`
                  }}
                  title={`Confidence Interval Range: [${ciLow}%, ${ciHigh}%]`}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
