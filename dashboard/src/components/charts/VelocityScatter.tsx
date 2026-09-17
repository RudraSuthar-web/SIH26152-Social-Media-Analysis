import React from 'react';
import { TrendTopic } from '../../types';

interface VelocityScatterProps {
  trends: TrendTopic[];
  onSelectTopic?: (topic: TrendTopic) => void;
}

export const VelocityScatter: React.FC<VelocityScatterProps> = ({ trends, onSelectTopic }) => {
  if (!trends || trends.length === 0) return null;

  const width = 500;
  const height = 220;
  const padding = 35;

  const maxVol = Math.max(...trends.map(t => t.volume), 100);
  const maxVel = Math.max(...trends.map(t => t.velocity), 1);

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto text-xs font-mono">
        {/* Axes */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#334155" strokeWidth="1.5" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#334155" strokeWidth="1.5" />

        {/* Labels */}
        <text x={width / 2} y={height - 5} fill="#64748b" textAnchor="middle" fontSize="10">
          Volume (log scale / absolute) →
        </text>
        <text x={10} y={height / 2} fill="#64748b" textAnchor="middle" fontSize="10" transform={`rotate(-90 10 ${height / 2})`}>
          Velocity (Growth Derivative) →
        </text>

        {/* Quadrant Lines */}
        <line x1={width / 2} y1={padding} x2={width / 2} y2={height - padding} stroke="#1e293b" strokeDasharray="3 3" />
        <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#1e293b" strokeDasharray="3 3" />

        {/* Trend Plot Dots */}
        {trends.map((t) => {
          const cx = padding + (t.volume / maxVol) * (width - padding * 2);
          const cy = height - padding - (t.velocity / maxVel) * (height - padding * 2);
          const r = Math.max(6, Math.min(18, t.trend_score / 8));
          const isCoordinated = t.coordinated_pattern;

          return (
            <g
              key={t.topic_id}
              onClick={() => onSelectTopic && onSelectTopic(t)}
              className="cursor-pointer group"
            >
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill={isCoordinated ? 'rgba(244, 63, 94, 0.6)' : 'rgba(56, 189, 248, 0.6)'}
                stroke={isCoordinated ? '#f43f5e' : '#38bdf8'}
                strokeWidth="2"
                className="transition-all hover:scale-125 hover:opacity-100"
              />
              <text
                x={cx + r + 4}
                y={cy + 3}
                fill="#f8fafc"
                fontSize="9"
                className="pointer-events-none group-hover:fill-cyan-400 font-bold"
              >
                {t.topic_label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
