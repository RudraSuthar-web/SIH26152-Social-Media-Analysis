import React from 'react';
import { SentimentTimePoint } from '../../types';

interface AreaChartProps {
  data: SentimentTimePoint[];
  height?: number;
}

export const AreaChart: React.FC<AreaChartProps> = ({ data, height = 240 }) => {
  if (!data || data.length === 0) return null;

  const maxTotal = Math.max(...data.map(d => d.total), 1);
  const width = 600;
  const padding = 30;
  const chartW = width - padding * 2;
  const chartH = height - padding * 2;

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * chartW;
    const posY = padding + chartH - (d.positive / maxTotal) * chartH;
    const negY = padding + chartH - (d.negative / maxTotal) * chartH;
    const neuY = padding + chartH - (d.neutral / maxTotal) * chartH;
    return { x, posY, negY, neuY, label: d.timestamp, ...d };
  });

  const makePath = (key: 'posY' | 'negY' | 'neuY') => {
    return points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p[key]}`, '');
  };

  const makeAreaPath = (key: 'posY' | 'negY' | 'neuY') => {
    const path = makePath(key);
    const firstX = points[0].x;
    const lastX = points[points.length - 1].x;
    const bottomY = padding + chartH;
    return `${path} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  };

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto text-xs font-mono">
        {/* Horizontal Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = padding + chartH * (1 - ratio);
          const val = Math.round(maxTotal * ratio);
          return (
            <g key={i}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#1e293b" strokeDasharray="3 3" />
              <text x={padding - 5} y={y + 3} fill="#64748b" textAnchor="end" fontSize="9">
                {val}
              </text>
            </g>
          );
        })}

        {/* Positive Sentiment Gradient Area */}
        <defs>
          <linearGradient id="posGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="negGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="neuGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Areas */}
        <path d={makeAreaPath('posY')} fill="url(#posGrad)" />
        <path d={makeAreaPath('negY')} fill="url(#negGrad)" />

        {/* Lines */}
        <path d={makePath('posY')} fill="none" stroke="#10b981" strokeWidth="2.5" />
        <path d={makePath('negY')} fill="none" stroke="#f43f5e" strokeWidth="2.5" />
        <path d={makePath('neuY')} fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 4" />

        {/* Point Dots */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.posY} r="3.5" fill="#10b981" />
            <circle cx={p.x} cy={p.negY} r="3.5" fill="#f43f5e" />
            {/* X Labels */}
            <text x={p.x} y={height - 8} fill="#94a3b8" textAnchor="middle" fontSize="10">
              {p.label}
            </text>
          </g>
        ))}
      </svg>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-2 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
          <span className="text-slate-300">Positive Sentiment</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
          <span className="text-slate-300">Negative Sentiment</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-cyan-400 inline-block" />
          <span className="text-slate-300">Neutral Sentiment</span>
        </div>
      </div>
    </div>
  );
};
