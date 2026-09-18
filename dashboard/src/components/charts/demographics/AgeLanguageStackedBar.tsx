import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChartContainer } from '../ChartContainer';

export interface AgeLanguageStack {
  bracket: string;
  hindi: number;
  english: number;
  hinglish: number;
  bengali: number;
  punjabi: number;
}

const mockAgeLangData: AgeLanguageStack[] = [
  { bracket: '13-17', hindi: 30, english: 25, hinglish: 35, bengali: 5, punjabi: 5 },
  { bracket: '18-25', hindi: 25, english: 30, hinglish: 30, bengali: 8, punjabi: 7 },
  { bracket: '26-35', hindi: 35, english: 35, hinglish: 15, bengali: 8, punjabi: 7 },
  { bracket: '36-50', hindi: 45, english: 30, hinglish: 10, bengali: 8, punjabi: 7 },
  { bracket: '50+', hindi: 55, english: 25, hinglish: 5, bengali: 8, punjabi: 7 }
];

interface Props {
  data?: AgeLanguageStack[];
  requestId?: string;
}

export const AgeLanguageStackedBar: React.FC<Props> = ({ data = mockAgeLangData, requestId = 'req-age-lang' }) => {
  return (
    <ChartContainer
      title="Age Bracket × Code-Switch Language Stacked Composition"
      subtitle="SOUL.md §12: Code-switching dynamics across demographic cohorts"
      requestId={requestId}
      exportFilename="age_language_stacked_bar"
      exportData={data}
    >
      <div className="h-64 w-full font-mono text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <XAxis dataKey="bracket" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} unit="%" />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
            />
            <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
            <Bar dataKey="hindi" stackId="a" fill="#06b6d4" name="Hindi" />
            <Bar dataKey="english" stackId="a" fill="#38bdf8" name="English" />
            <Bar dataKey="hinglish" stackId="a" fill="#a855f7" name="Hinglish" />
            <Bar dataKey="bengali" stackId="a" fill="#10b981" name="Bengali" />
            <Bar dataKey="punjabi" stackId="a" fill="#f59e0b" name="Punjabi" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
};
