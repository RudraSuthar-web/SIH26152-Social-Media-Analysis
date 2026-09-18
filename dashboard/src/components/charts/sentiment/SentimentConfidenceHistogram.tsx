import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChartContainer } from '../ChartContainer';
import { CHART_COLORS } from '../chart-types';

export interface ConfidenceBucket {
  bucket: string;
  positive: number;
  negative: number;
  neutral: number;
}

const mockBucketData: ConfidenceBucket[] = [
  { bucket: '50-60%', positive: 120, negative: 85, neutral: 210 },
  { bucket: '60-70%', positive: 340, negative: 190, neutral: 450 },
  { bucket: '70-80%', positive: 780, negative: 430, neutral: 620 },
  { bucket: '80-90%', positive: 1450, negative: 890, neutral: 910 },
  { bucket: '90-100%', positive: 2890, negative: 1420, neutral: 1240 }
];

interface Props {
  data?: ConfidenceBucket[];
  requestId?: string;
}

export const SentimentConfidenceHistogram: React.FC<Props> = ({ data = mockBucketData, requestId = 'req-conf-hist' }) => {
  return (
    <ChartContainer
      title="Sentiment Model Confidence Calibration Histogram"
      subtitle="SOUL.md §7: Score distribution across held-out confidence intervals"
      requestId={requestId}
      exportFilename="sentiment_confidence_histogram"
      exportData={data}
    >
      <div className="h-64 w-full font-mono text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <XAxis dataKey="bucket" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
            />
            <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
            <Bar dataKey="positive" fill={CHART_COLORS.semantic.positive} name="Positive" radius={[4, 4, 0, 0]} />
            <Bar dataKey="negative" fill={CHART_COLORS.semantic.negative} name="Negative" radius={[4, 4, 0, 0]} />
            <Bar dataKey="neutral" fill={CHART_COLORS.semantic.neutral} name="Neutral" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
};
