import { DataSourceType } from '../../types';

export const CHART_COLORS = {
  categorical: [
    '#38bdf8', // cyan-400
    '#10b981', // emerald-500
    '#f59e0b', // amber-500
    '#a855f7', // purple-500
    '#f43f5e', // rose-500
    '#06b6d4', // cyan-500
    '#84cc16', // lime-500
    '#ec4899', // pink-500
    '#6366f1', // indigo-500
    '#14b8a6', // teal-500
  ],
  semantic: {
    positive: '#10b981',
    negative: '#ef4444',
    neutral: '#06b6d4',
    observed: '#38bdf8',
    inferred: '#a855f7',
    coordinated: '#f43f5e',
    organic: '#10b981',
    live: '#10b981',
    synthetic: '#64748b',
    degraded: '#f59e0b',
  },
  heatmap: ['#0f172a', '#083344', '#155e75', '#0e7490', '#06b6d4', '#22d3ee']
};

export interface ChartContainerProps {
  title: string;
  subtitle?: string;
  dataSource?: DataSourceType;
  requestId?: string;
  children: React.ReactNode;
  exportFilename?: string;
  exportData?: any[];
  className?: string;
  meta?: any;
}
