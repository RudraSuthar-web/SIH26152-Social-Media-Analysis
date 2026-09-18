import React from 'react';
import { ChartContainer } from '../ChartContainer';

export interface LanguageSentimentMatrix {
  language: string;
  positive: number;
  neutral: number;
  negative: number;
  avgConfidence: number;
}

const mockLangData: LanguageSentimentMatrix[] = [
  { language: 'English (EN)', positive: 64, neutral: 24, negative: 12, avgConfidence: 0.94 },
  { language: 'Hindi (HI)', positive: 58, neutral: 28, negative: 14, avgConfidence: 0.91 },
  { language: 'Hinglish (HI-EN)', positive: 45, neutral: 35, negative: 20, avgConfidence: 0.84 },
  { language: 'Bengali (BN)', positive: 60, neutral: 25, negative: 15, avgConfidence: 0.88 },
  { language: 'Punjabi (PA)', positive: 52, neutral: 30, negative: 18, avgConfidence: 0.86 },
  { language: 'Tamil (TA)', positive: 62, neutral: 26, negative: 12, avgConfidence: 0.89 }
];

interface Props {
  data?: LanguageSentimentMatrix[];
  requestId?: string;
}

export const LanguageSentimentHeatmap: React.FC<Props> = ({ data = mockLangData, requestId = 'req-lang-heat' }) => {
  return (
    <ChartContainer
      title="Language & Code-Switch Sentiment Heatmap Matrix"
      subtitle="SOUL.md §8: Multi-dialect stance & confidence distribution"
      requestId={requestId}
      exportFilename="language_sentiment_heatmap"
      exportData={data}
    >
      <div className="space-y-3 font-mono text-xs">
        <div className="grid grid-cols-5 gap-2 pb-2 text-[10px] text-slate-400 font-bold uppercase border-b border-slate-800 text-center">
          <span className="text-left">Language</span>
          <span>Positive %</span>
          <span>Neutral %</span>
          <span>Negative %</span>
          <span>Avg Conf</span>
        </div>

        {data.map((row) => (
          <div key={row.language} className="grid grid-cols-5 gap-2 items-center p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/30 transition-all text-center">
            <span className="text-left font-bold text-white text-xs">{row.language}</span>
            
            <div className="p-1.5 rounded bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 font-bold">
              {row.positive}%
            </div>

            <div className="p-1.5 rounded bg-cyan-950/40 border border-cyan-800/40 text-cyan-400 font-bold">
              {row.neutral}%
            </div>

            <div className="p-1.5 rounded bg-rose-950/40 border border-rose-800/40 text-rose-400 font-bold">
              {row.negative}%
            </div>

            <div className="p-1.5 rounded bg-purple-950/40 border border-purple-800/40 text-purple-300 font-bold">
              {(row.avgConfidence * 100).toFixed(0)}%
            </div>
          </div>
        ))}
      </div>
    </ChartContainer>
  );
};
