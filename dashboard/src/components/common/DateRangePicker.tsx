import React from 'react';
import { useAnalytics } from '../../context/AnalyticsContext';
import { TimeRangeOption } from '../../types';
import { Clock } from 'lucide-react';

export const DateRangePicker: React.FC = () => {
  const { timeRange, setTimeRange } = useAnalytics();

  const options: { value: TimeRangeOption; label: string }[] = [
    { value: '15m', label: '15 Min' },
    { value: '1h', label: '1 Hour' },
    { value: '24h', label: '24 Hours' },
    { value: '7d', label: '7 Days' }
  ];

  return (
    <div className="flex items-center bg-slate-900/80 p-1 rounded-lg border border-slate-800">
      <Clock className="w-3.5 h-3.5 text-slate-400 ml-2 mr-1" />
      <div className="flex items-center gap-1">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setTimeRange(opt.value)}
            className={`px-2.5 py-1 text-xs font-mono font-medium rounded-md transition-all ${
              timeRange === opt.value
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
};
