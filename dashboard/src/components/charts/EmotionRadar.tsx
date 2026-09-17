import React from 'react';
import { EmotionBreakdown } from '../../types';

interface EmotionRadarProps {
  emotions: EmotionBreakdown;
}

export const EmotionRadar: React.FC<EmotionRadarProps> = ({ emotions }) => {
  const items = [
    { key: 'supportive', label: 'Supportive', val: emotions.supportive, color: 'bg-emerald-500' },
    { key: 'excitement', label: 'Excitement', val: emotions.excitement, color: 'bg-cyan-500' },
    { key: 'opposing', label: 'Opposing', val: emotions.opposing, color: 'bg-amber-500' },
    { key: 'anxiety', label: 'Anxiety', val: emotions.anxiety, color: 'bg-purple-500' },
    { key: 'anger', label: 'Anger', val: emotions.anger, color: 'bg-rose-500' },
    { key: 'sarcasm', label: 'Sarcasm', val: emotions.sarcasm, color: 'bg-pink-500' },
    { key: 'uncertainty', label: 'Uncertainty', val: emotions.uncertainty, color: 'bg-indigo-500' }
  ];

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const pct = Math.round(item.val * 100);
        return (
          <div key={item.key} className="space-y-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 font-semibold">{item.label}</span>
              <span className="text-slate-400">{pct}%</span>
            </div>
            <div className="h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800 flex">
              <div
                className={`h-full ${item.color} transition-all duration-500 rounded-full`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
