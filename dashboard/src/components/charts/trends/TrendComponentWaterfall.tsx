import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChartContainer } from '../ChartContainer';

export interface TrendWaterfallStep {
  component: string;
  value: number;
  type: 'base' | 'multiplier' | 'final';
}

const mockWaterfallSteps: TrendWaterfallStep[] = [
  { component: 'Log Volume log(V+1)', value: 10.12, type: 'base' },
  { component: 'Growth Factor (1+g)', value: 4.42, type: 'multiplier' },
  { component: 'Velocity Derivative (1+v)', value: 3.22, type: 'multiplier' },
  { component: 'Decay Factor', value: 0.95, type: 'multiplier' },
  { component: 'Final TrendScore', value: 137.8, type: 'final' }
];

interface Props {
  data?: TrendWaterfallStep[];
  topicLabel?: string;
  requestId?: string;
}

export const TrendComponentWaterfall: React.FC<Props> = ({
  data = mockWaterfallSteps,
  topicLabel = 'NTRO AI Analytics Framework',
  requestId = 'req-waterfall'
}) => {
  return (
    <ChartContainer
      title={`TrendScore Multiplicative Breakdown: ${topicLabel}`}
      subtitle="SOUL.md §10: Step-by-step contribution of volume, growth, velocity, and decay"
      requestId={requestId}
      exportFilename="trend_component_waterfall"
      exportData={data}
    >
      <div className="h-64 w-full font-mono text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <XAxis dataKey="component" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
            />
            <Bar dataKey="value" name="Value / Multiplier" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.type === 'base'
                      ? '#38bdf8'
                      : entry.type === 'multiplier'
                      ? '#a855f7'
                      : '#10b981'
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
};
