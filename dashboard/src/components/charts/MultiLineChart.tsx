import React, { useState } from 'react';

export const MultiLineChart: React.FC = () => {
  const [metric, setMetric] = useState('Impressions');

  const width = 650;
  const height = 260;
  const padding = 40;

  // Mock time-series data per platform
  const platforms = [
    { name: 'X (Twitter)', color: '#38bdf8', points: [20, 35, 25, 45, 30, 65, 50, 85, 70, 95] },
    { name: 'Telegram', color: '#229ed9', points: [15, 22, 38, 30, 52, 48, 60, 55, 78, 82] },
    { name: 'Reddit', color: '#ff4500', points: [10, 18, 14, 25, 20, 32, 28, 40, 35, 42] },
    { name: 'YouTube', color: '#ff0000', points: [25, 30, 42, 38, 60, 58, 72, 68, 85, 90] },
    { name: 'Instagram', color: '#e1306c', points: [30, 45, 35, 60, 50, 75, 65, 88, 72, 98] }
  ];

  const times = ['May 1', 'May 5', 'May 9', 'May 13', 'May 17', 'May 21', 'May 25', 'May 29', 'Jun 2', 'Jun 6'];

  const chartW = width - padding * 2;
  const chartH = height - padding * 2;
  const maxVal = 100;

  return (
    <div className="space-y-3">
      {/* Header Dropdown Control */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
        <div className="flex items-center gap-2 text-xs font-mono">
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
            className="bg-slate-900 text-white font-bold border border-slate-700 rounded-md px-2.5 py-1 text-xs outline-none cursor-pointer"
          >
            <option value="Impressions">Impressions</option>
            <option value="Event Volume">Event Volume</option>
            <option value="Interactions">Interactions</option>
            <option value="Sentiment Index">Sentiment Index</option>
          </select>
          <span className="text-slate-400 font-semibold">over time by Platform</span>
        </div>

        {/* Legend Pills */}
        <div className="flex items-center gap-3 text-[11px] font-mono">
          {platforms.map((p) => (
            <div key={p.name} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: p.color }} />
              <span className="text-slate-300 font-medium">{p.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SVG Chart */}
      <div className="w-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto text-xs font-mono">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = padding + chartH * (1 - ratio);
            const val = Math.round(maxVal * ratio * 800);
            return (
              <g key={i}>
                <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#1e293b" strokeDasharray="3 3" />
                <text x={padding - 8} y={y + 3} fill="#64748b" textAnchor="end" fontSize="9">
                  {val.toLocaleString()}
                </text>
              </g>
            );
          })}

          {/* Platform Line Series */}
          {platforms.map((p) => {
            const pathStr = p.points.reduce((acc, val, i) => {
              const x = padding + (i / (p.points.length - 1)) * chartW;
              const y = padding + chartH - (val / maxVal) * chartH;
              return `${acc} ${i === 0 ? 'M' : 'L'} ${x} ${y}`;
            }, '');

            return (
              <g key={p.name}>
                <path d={pathStr} fill="none" stroke={p.color} strokeWidth="2.5" />
                {p.points.map((val, i) => {
                  const x = padding + (i / (p.points.length - 1)) * chartW;
                  const y = padding + chartH - (val / maxVal) * chartH;
                  return <circle key={i} cx={x} cy={y} r="3" fill={p.color} />;
                })}
              </g>
            );
          })}

          {/* Time Labels */}
          {times.map((t, i) => {
            const x = padding + (i / (times.length - 1)) * chartW;
            return (
              <text key={i} x={x} y={height - 8} fill="#94a3b8" textAnchor="middle" fontSize="9">
                {t}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
