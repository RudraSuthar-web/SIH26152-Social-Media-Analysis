import React, { useState } from 'react';

export const DonutChart: React.FC = () => {
  const [metric, setMetric] = useState('Followers');

  const slices = [
    { name: 'X (Twitter)', color: '#38bdf8', pct: 0.42 },
    { name: 'Telegram', color: '#229ed9', pct: 0.23 },
    { name: 'Instagram', color: '#e1306c', pct: 0.15 },
    { name: 'Reddit', color: '#ff4500', pct: 0.12 },
    { name: 'YouTube', color: '#ff0000', pct: 0.08 }
  ];

  const size = 200;
  const center = size / 2;
  const radius = 70;
  let accumulatedAngle = 0;

  return (
    <div className="space-y-3">
      {/* Dropdown Control */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
        <div className="flex items-center gap-2 text-xs font-mono">
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
            className="bg-slate-900 text-white font-bold border border-slate-700 rounded-md px-2.5 py-1 text-xs outline-none cursor-pointer"
          >
            <option value="Followers">Followers</option>
            <option value="Impressions">Impressions</option>
            <option value="Interactions">Interactions</option>
          </select>
          <span className="text-slate-400 font-semibold">by Platform</span>
        </div>
      </div>

      {/* SVG Donut / Pie */}
      <div className="flex flex-col items-center justify-center space-y-4">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-48 h-48">
          {slices.map((slice, i) => {
            const angle = slice.pct * 2 * Math.PI;
            const startAngle = accumulatedAngle;
            accumulatedAngle += angle;
            const endAngle = accumulatedAngle;

            const x1 = center + radius * Math.cos(startAngle);
            const y1 = center + radius * Math.sin(startAngle);
            const x2 = center + radius * Math.cos(endAngle);
            const y2 = center + radius * Math.sin(endAngle);

            const largeArc = angle > Math.PI ? 1 : 0;
            const pathData = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

            return (
              <path
                key={slice.name}
                d={pathData}
                fill={slice.color}
                stroke="#0f172a"
                strokeWidth="2"
                className="transition-all hover:opacity-80 cursor-pointer"
              />
            );
          })}
          {/* Donut Center Hole */}
          <circle cx={center} cy={center} r="35" fill="#0f172a" />
        </svg>

        {/* Legend List */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] font-mono">
          {slices.map((s) => (
            <div key={s.name} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: s.color }} />
              <span className="text-slate-300 font-medium">{s.name} ({Math.round(s.pct * 100)}%)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
