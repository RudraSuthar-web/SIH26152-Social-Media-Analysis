import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChartContainer } from '../ChartContainer';
import { CHART_COLORS } from '../chart-types';

export interface CentralityBucket {
  bin: string;
  pagerankNodes: number;
  betweennessNodes: number;
  degreeNodes: number;
}

const mockCentralityBins: CentralityBucket[] = [
  { bin: '0.00 - 0.02', pagerankNodes: 340, betweennessNodes: 410, degreeNodes: 280 },
  { bin: '0.02 - 0.05', pagerankNodes: 120, betweennessNodes: 95, degreeNodes: 140 },
  { bin: '0.05 - 0.10', pagerankNodes: 45, betweennessNodes: 30, degreeNodes: 60 },
  { bin: '0.10 - 0.20', pagerankNodes: 18, betweennessNodes: 12, degreeNodes: 25 },
  { bin: '0.20+', pagerankNodes: 5, betweennessNodes: 3, degreeNodes: 8 }
];

interface Props {
  data?: CentralityBucket[];
  requestId?: string;
}

export const CentralityDistribution: React.FC<Props> = ({ data = mockCentralityBins, requestId = 'req-centrality-dist' }) => {
  return (
    <ChartContainer
      title="Centrality Vector Distribution Histogram (Log Scale)"
      subtitle="SOUL.md §15: Quantifying actor influence threshold & KOL cutoffs"
      requestId={requestId}
      exportFilename="centrality_vector_distribution"
      exportData={data}
    >
      <div className="h-64 w-full font-mono text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <XAxis dataKey="bin" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
            />
            <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
            <Bar dataKey="pagerankNodes" fill={CHART_COLORS.categorical[0]} name="PageRank" radius={[4, 4, 0, 0]} />
            <Bar dataKey="betweennessNodes" fill={CHART_COLORS.categorical[1]} name="Betweenness" radius={[4, 4, 0, 0]} />
            <Bar dataKey="degreeNodes" fill={CHART_COLORS.categorical[3]} name="Degree" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
};
