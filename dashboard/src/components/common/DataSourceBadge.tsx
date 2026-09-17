import React from 'react';
import { DataSourceType } from '../../types';
import { ShieldCheck, Database, AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  source: DataSourceType;
  showIcon?: boolean;
}

export const DataSourceBadge: React.FC<Props> = ({ source, showIcon = true }) => {
  const getBadgeStyle = () => {
    switch (source) {
      case 'live':
        return {
          className: 'badge-live',
          label: 'LIVE INTELLIGENCE',
          icon: <ShieldCheck className="w-3.5 h-3.5" />
        };
      case 'synthetic':
        return {
          className: 'badge-synthetic',
          label: 'SYNTHETIC TEST FEED',
          icon: <Database className="w-3.5 h-3.5" />
        };
      case 'degraded':
        return {
          className: 'badge-degraded',
          label: 'DEGRADED COVERAGE',
          icon: <AlertTriangle className="w-3.5 h-3.5" />
        };
      case 'replay':
        return {
          className: 'badge-replay',
          label: 'REPLAY / BACKFILL',
          icon: <RotateCcw className="w-3.5 h-3.5" />
        };
      default:
        return {
          className: 'badge-synthetic',
          label: (source as string).toUpperCase(),
          icon: <Database className="w-3.5 h-3.5" />
        };
    }
  };

  const style = getBadgeStyle();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold tracking-wider ${style.className}`}
    >
      {showIcon && style.icon}
      {style.label}
    </span>
  );
};
