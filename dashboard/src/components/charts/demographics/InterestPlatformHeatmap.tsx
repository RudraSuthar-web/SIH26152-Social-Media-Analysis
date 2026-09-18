import React from 'react';
import { ChartContainer } from '../ChartContainer';

export interface InterestPlatformRow {
  interest: string;
  xPct: number;
  telegramPct: number;
  totalVolume: number;
}

const mockInterestData: InterestPlatformRow[] = [
  { interest: 'Cyber Security & Infra', xPct: 62, telegramPct: 38, totalVolume: 42100 },
  { interest: 'AI & Data Governance', xPct: 78, telegramPct: 22, totalVolume: 38500 },
  { interest: 'Defense Technology', xPct: 45, telegramPct: 55, totalVolume: 29400 },
  { interest: 'Public Policy & Telecom', xPct: 82, telegramPct: 18, totalVolume: 18900 },
  { interest: 'Cryptographic Protocols', xPct: 35, telegramPct: 65, totalVolume: 14200 }
];

interface Props {
  data?: InterestPlatformRow[];
  requestId?: string;
}

export const InterestPlatformHeatmap: React.FC<Props> = ({ data = mockInterestData, requestId = 'req-interest-plat' }) => {
  return (
    <ChartContainer
      title="Audience Interest × Platform Ingestion Volume Distribution"
      subtitle="SOUL.md §12: Cross-platform topic affinity & volume split"
      requestId={requestId}
      exportFilename="interest_platform_heatmap"
      exportData={data}
    >
      <div className="space-y-3 font-mono text-xs">
        <div className="grid grid-cols-4 gap-2 pb-2 text-[10px] text-slate-400 font-bold uppercase border-b border-slate-800 text-center">
          <span className="text-left col-span-2">Interest Cluster</span>
          <span>X (Twitter) %</span>
          <span>Telegram %</span>
        </div>

        {data.map((row) => (
          <div key={row.interest} className="grid grid-cols-4 gap-2 items-center p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-cyan-500/30 transition-all text-center">
            <div className="text-left col-span-2">
              <span className="font-bold text-white text-xs block">{row.interest}</span>
              <span className="text-[10px] text-slate-500">Vol: {row.totalVolume.toLocaleString()} events</span>
            </div>

            <div className="p-1.5 rounded bg-cyan-950/40 border border-cyan-800/40 text-cyan-400 font-bold">
              {row.xPct}%
            </div>

            <div className="p-1.5 rounded bg-purple-950/40 border border-purple-800/40 text-purple-400 font-bold">
              {row.telegramPct}%
            </div>
          </div>
        ))}
      </div>
    </ChartContainer>
  );
};
