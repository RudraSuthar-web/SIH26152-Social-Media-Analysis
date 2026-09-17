import React, { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  subtitle?: string;
  icon?: ReactNode;
  accentColor?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'purple';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  isPositive = true,
  subtitle,
  icon,
  accentColor = 'cyan'
}) => {
  const getAccentBorder = () => {
    switch (accentColor) {
      case 'emerald': return 'hover:border-emerald-500/40';
      case 'amber': return 'hover:border-amber-500/40';
      case 'rose': return 'hover:border-rose-500/40';
      case 'purple': return 'hover:border-purple-500/40';
      default: return 'hover:border-cyan-500/40';
    }
  };

  const getIconBg = () => {
    switch (accentColor) {
      case 'emerald': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'amber': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'rose': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'purple': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default: return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
    }
  };

  return (
    <div className={`glass-panel p-5 relative overflow-hidden group ${getAccentBorder()}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <h3 className="text-2xl font-bold font-mono text-white mt-1.5 tracking-tight">{value}</h3>
          
          {(change || subtitle) && (
            <div className="flex items-center gap-2 mt-2 text-xs">
              {change && (
                <span
                  className={`inline-flex items-center gap-0.5 font-semibold px-1.5 py-0.5 rounded ${
                    isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                  }`}
                >
                  {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {change}
                </span>
              )}
              {subtitle && <span className="text-slate-400">{subtitle}</span>}
            </div>
          )}
        </div>

        {icon && (
          <div className={`p-2.5 rounded-xl border ${getIconBg()}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};
