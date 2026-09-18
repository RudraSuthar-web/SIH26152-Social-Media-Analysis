import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, ZAxis } from 'recharts';
import { ChartContainer } from '../ChartContainer';
import { CHART_COLORS } from '../chart-types';

export interface SarcasmPoint {
  confidence: number;
  sarcasm_score: number;
  uncertain: boolean;
  language: string;
}

const mockSarcasmPoints: SarcasmPoint[] = [
  { confidence: 0.88, sarcasm_score: 0.12, uncertain: false, language: 'en' },
  { confidence: 0.76, sarcasm_score: 0.82, uncertain: true, language: 'hinglish' },
  { confidence: 0.92, sarcasm_score: 0.05, uncertain: false, language: 'hi' },
  { confidence: 0.64, sarcasm_score: 0.74, uncertain: true, language: 'hinglish' },
  { confidence: 0.95, sarcasm_score: 0.15, uncertain: false, language: 'gu' },
  { confidence: 0.58, sarcasm_score: 0.89, uncertain: true, language: 'pa' },
  { confidence: 0.82, sarcasm_score: 0.22, uncertain: false, language: 'ta' }
];

interface Props {
  data?: SarcasmPoint[];
  requestId?: string;
}

export const SarcasmUncertaintyScatter: React.FC<Props> = ({ data = mockSarcasmPoints, requestId = 'req-sarcasm' }) => {
  const certainPoints = data.filter((p) => !p.uncertain);
  const uncertainPoints = data.filter((p) => p.uncertain);

  return (
    <ChartContainer
      title="Sarcasm & Multilingual Uncertainty Scatter Matrix"
      subtitle="SOUL.md §9: Disambiguating literal sentiment vs sarcasm flags"
      requestId={requestId}
      exportFilename="sarcasm_uncertainty_matrix"
      exportData={data}
    >
      <div className="h-64 w-full font-mono text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <XAxis
              type="number"
              dataKey="confidence"
              name="Confidence"
              domain={[0.4, 1.0]}
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              unit=""
            />
            <YAxis
              type="number"
              dataKey="sarcasm_score"
              name="Sarcasm Score"
              domain={[0, 1.0]}
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
            />
            <ZAxis type="number" range={[60, 120]} />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
            />
            <Scatter name="Literal Sentiment" data={certainPoints} fill={CHART_COLORS.semantic.positive} shape="circle" />
            <Scatter name="Sarcasm Flagged (Uncertain)" data={uncertainPoints} fill={CHART_COLORS.semantic.coordinated} shape="triangle" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
};
