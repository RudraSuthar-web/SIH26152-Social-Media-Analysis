import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChartContainer } from '../ChartContainer';

export interface LatencyPoint {
  time: string;
  p50: number;
  p95: number;
  p99: number;
}

const mockLatencyTimeline: LatencyPoint[] = [
  { time: '00:00', p50: 8.2, p95: 18.4, p99: 32.1 },
  { time: '04:00', p50: 8.5, p95: 19.1, p99: 33.5 },
  { time: '08:00', p50: 9.1, p95: 22.4, p99: 38.2 },
  { time: '12:00', p50: 11.2, p95: 26.8, p99: 45.1 },
  { time: '16:00', p50: 9.8, p95: 21.2, p99: 36.4 },
  { time: '20:00', p50: 8.7, p95: 18.9, p99: 31.8 },
  { time: '24:00', p50: 8.3, p95: 18.2, p99: 30.5 }
];

interface Props {
  data?: LatencyPoint[];
  requestId?: string;
}

export const ModelLatencyPercentiles: React.FC<Props> = ({ data = mockLatencyTimeline, requestId = 'req-latency-pct' }) => {
  return (
    <ChartContainer
      title="ONNX Model Inference Latency Percentiles (p50 / p95 / p99)"
      subtitle="SOUL.md §23: CUDA/ONNX Runtime SLA tracking & anomaly detection"
      requestId={requestId}
      exportFilename="model_latency_percentiles"
      exportData={data}
    >
      <div className="h-64 w-full font-mono text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <XAxis dataKey="time" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} unit="ms" />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
            />
            <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
            <Area type="monotone" dataKey="p99" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.15} name="P99 Latency (ms)" />
            <Area type="monotone" dataKey="p95" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.25} name="P95 Latency (ms)" />
            <Area type="monotone" dataKey="p50" stroke="#10b981" fill="#10b981" fillOpacity={0.35} name="P50 Latency (ms)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
};
