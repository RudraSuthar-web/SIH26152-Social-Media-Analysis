import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, ZAxis } from 'recharts';
import { ChartContainer } from '../ChartContainer';
import { CHART_COLORS } from '../chart-types';

export interface CoordinationPoint {
  topic_label: string;
  unique_users: number;
  volume: number;
  velocity: number;
  coordinated: boolean;
}

const mockCoordPoints: CoordinationPoint[] = [
  { topic_label: 'NTRO AI Analytics Framework', unique_users: 18400, volume: 24890, velocity: 3.22, coordinated: false },
  { topic_label: 'BOT BURST #CyberSec', unique_users: 2100, volume: 19800, velocity: 8.45, coordinated: true },
  { topic_label: 'Multilingual Sentiment Disambiguation', unique_users: 12100, volume: 14200, velocity: 2.15, coordinated: false },
  { topic_label: 'COORDINATED REPEAT #DefTech', unique_users: 980, volume: 15400, velocity: 9.12, coordinated: true },
  { topic_label: 'Leiden Community Partitioning', unique_users: 9400, volume: 11200, velocity: 1.85, coordinated: false }
];

interface Props {
  data?: CoordinationPoint[];
  requestId?: string;
}

export const CoordinationScatter: React.FC<Props> = ({ data = mockCoordPoints, requestId = 'req-coord-scatter' }) => {
  const organicData = data.filter((d) => !d.coordinated);
  const coordinatedData = data.filter((d) => d.coordinated);

  return (
    <ChartContainer
      title="Coordinated vs Organic Pattern Isolation Scatter Matrix"
      subtitle="SOUL.md §11: Isolating abnormal volume-to-unique user ratios"
      requestId={requestId}
      exportFilename="coordinated_vs_organic_scatter"
      exportData={data}
    >
      <div className="h-64 w-full font-mono text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <XAxis type="number" dataKey="unique_users" name="Unique Users" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis type="number" dataKey="volume" name="Total Volume" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <ZAxis type="number" dataKey="velocity" range={[80, 250]} name="Velocity" />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
            />
            <Scatter name="Organic Traffic" data={organicData} fill={CHART_COLORS.semantic.organic} shape="circle" />
            <Scatter name="Coordinated Pattern (⚠)" data={coordinatedData} fill={CHART_COLORS.semantic.coordinated} shape="triangle" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
};
