import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { ChartContainer } from '../ChartContainer';

export interface RateLimitPoint {
  time: string;
  xUsagePct: number;
  telegramUsagePct: number;
}

const mockRateLimitData: RateLimitPoint[] = [
  { time: '00:00', xUsagePct: 12, telegramUsagePct: 5 },
  { time: '04:00', xUsagePct: 18, telegramUsagePct: 8 },
  { time: '08:00', xUsagePct: 28, telegramUsagePct: 12 },
  { time: '12:00', xUsagePct: 45, telegramUsagePct: 18 },
  { time: '16:00', xUsagePct: 68, telegramUsagePct: 22 },
  { time: '20:00', xUsagePct: 82, telegramUsagePct: 28 },
  { time: '24:00', xUsagePct: 91, telegramUsagePct: 34 }
];

interface Props {
  data?: RateLimitPoint[];
  requestId?: string;
}

export const RateLimitBurnChart: React.FC<Props> = ({ data = mockRateLimitData, requestId = 'req-ratelimit-burn' }) => {
  return (
    <ChartContainer
      title="API Adapter Rate Limit Quota Burn & Exhaustion Curve"
      subtitle="SOUL.md §23: Proactive rate-limit budget tracking & window exhaustion forecasting"
      requestId={requestId}
      exportFilename="adapter_rate_limit_burn"
      exportData={data}
    >
      <div className="h-64 w-full font-mono text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <XAxis dataKey="time" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} unit="%" domain={[0, 100]} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
            />
            <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
            <ReferenceLine y={85} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Warning 85%', fill: '#f59e0b', fontSize: 10 }} />
            <Line type="monotone" dataKey="xUsagePct" stroke="#06b6d4" name="X API Quota %" strokeWidth={2.5} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="telegramUsagePct" stroke="#a855f7" name="Telegram API Quota %" strokeWidth={2.5} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
};
