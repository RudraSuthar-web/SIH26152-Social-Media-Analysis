import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { TrendTopic, ApiMeta } from '../types';
import { VelocityScatter } from '../components/charts/VelocityScatter';
import { CoordinationScatter } from '../components/charts/trends/CoordinationScatter';
import { TrendComponentWaterfall } from '../components/charts/trends/TrendComponentWaterfall';
import { DataSourceBadge } from '../components/common/DataSourceBadge';
import { CsvExportButton } from '../components/common/CsvExportButton';
import { TrendingUp, AlertTriangle, Calculator, Zap } from 'lucide-react';

export const TrendsPage: React.FC = () => {
  const [trends, setTrends] = useState<TrendTopic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<TrendTopic | null>(null);
  const [meta, setMeta] = useState<ApiMeta | null>(null);

  useEffect(() => {
    apiService.getTrends().then((res) => {
      setTrends(res.data);
      setMeta(res.meta);
      if (res.data.length > 0) setSelectedTopic(res.data[0]);
    });
  }, []);

  return (
    <div className="space-y-6" role="region" aria-label="Trend & Narrative Tracking Vector">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 panel-card p-5">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold font-mono text-white">Real-Time Trend & Narrative Tracking Vector</h2>
            {meta && <DataSourceBadge source={meta.data_source} />}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tracking narrative acceleration, volume vs velocity derivatives, and coordinated pattern detection (SOUL.md §10, §11).
          </p>
        </div>

        {meta && <CsvExportButton data={trends} filename="trending_narratives.csv" meta={meta} />}
      </div>

      {/* Scatter Plot + Inline Computed Formula */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scatter Plot */}
        <div className="panel-card p-5 space-y-4">
          <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" /> Volume vs. Growth Velocity Matrix
            </h3>
            <span className="text-[11px] font-mono text-slate-400">Click node for topic audit</span>
          </div>

          <VelocityScatter trends={trends} onSelectTopic={(t) => setSelectedTopic(t)} />
        </div>

        {/* Inline Computed Formula Inspector - TrendFormulaBreakdown */}
        <div className="panel-card p-5 space-y-4">
          <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-cyan-400" /> Computed Trend Score Math Breakdown
            </h3>
            <span className="text-[11px] font-mono text-slate-400">Inline Computed Breakdown</span>
          </div>

          {selectedTopic ? (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-bold text-white text-sm flex items-center gap-2">
                  {selectedTopic.topic_label}
                  {selectedTopic.coordinated_pattern && (
                    <span className="text-[10px] text-rose-400 bg-rose-950/50 px-1.5 py-0.5 rounded border border-rose-800">
                      Coordinated
                    </span>
                  )}
                </span>
                <span className="text-cyan-400 font-bold text-sm">TrendScore: {selectedTopic.trend_score.toFixed(1)}</span>
              </div>

              <div className="space-y-2 text-slate-300">
                <div className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400">Log Volume Weight:</span>
                  <strong className="text-cyan-400">log₁₀({selectedTopic.volume.toLocaleString()} + 1) = {selectedTopic.components.volume_score.toFixed(2)}</strong>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400">Growth Multiplier:</span>
                  <strong className="text-emerald-400">1 + {selectedTopic.components.growth_rate.toFixed(2)} = {(1 + selectedTopic.components.growth_rate).toFixed(2)}</strong>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400">Velocity Derivative:</span>
                  <strong className="text-purple-400">1 + {selectedTopic.components.velocity.toFixed(2)} = {(1 + selectedTopic.components.velocity).toFixed(2)}</strong>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400">Half-Life Decay:</span>
                  <strong className="text-amber-400">{selectedTopic.components.decay.toFixed(2)}</strong>
                </div>
              </div>

              <div className="p-3 rounded bg-cyan-950/40 text-cyan-300 text-[11px] border border-cyan-800/50 text-center font-bold space-y-1">
                <div>Formula: TrendScore = log(V+1) × (1 + g) × (1 + v) × Decay</div>
                <div className="text-[10px] text-cyan-400 font-normal">
                  Calculation: {selectedTopic.components.volume_score.toFixed(2)} × {(1 + selectedTopic.components.growth_rate).toFixed(2)} × {(1 + selectedTopic.components.velocity).toFixed(2)} × {selectedTopic.components.decay.toFixed(2)} = <strong className="text-white">{selectedTopic.trend_score.toFixed(1)}</strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs font-mono text-slate-500">Select a topic from the matrix to inspect computed values.</div>
          )}
        </div>
      </div>

      {/* Expanded Charts Row (CHART_EXPANSION.md) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CoordinationScatter requestId={meta?.request_id} />
        <TrendComponentWaterfall topicLabel={selectedTopic?.topic_label} requestId={meta?.request_id} />
      </div>

      {/* Trend Topics Table with CSV Export */}
      <div className="panel-card overflow-hidden">
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold font-mono text-white">Active Trending Narratives</h3>
          <span className="text-xs font-mono text-slate-400">SOUL.md §10 Metrics</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono" role="table" aria-label="Trending narratives table">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th scope="col" className="px-4 py-2.5">Topic Label</th>
                <th scope="col" className="px-4 py-2.5 text-right">Volume</th>
                <th scope="col" className="px-4 py-2.5 text-right">Growth %</th>
                <th scope="col" className="px-4 py-2.5 text-right">Velocity</th>
                <th scope="col" className="px-4 py-2.5 text-right">Trend Score</th>
                <th scope="col" className="px-4 py-2.5 text-center">Pattern Flag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {trends.map((t) => (
                <tr
                  key={t.topic_id}
                  onClick={() => setSelectedTopic(t)}
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedTopic(t); }}
                  className={`hover:bg-slate-900/60 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
                    selectedTopic?.topic_id === t.topic_id ? 'bg-slate-900/80 border-l-2 border-l-cyan-400' : ''
                  }`}
                  aria-label={`Select trend ${t.topic_label}`}
                >
                  <td className="px-4 py-3 font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    {t.topic_label}
                  </td>
                  <td className="px-4 py-3 text-right">{t.volume.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-400">
                    +{Math.round(t.growth_rate * 100)}%
                  </td>
                  <td className="px-4 py-3 text-right text-slate-300">{t.velocity.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-bold text-cyan-400">{t.trend_score.toFixed(1)}</td>
                  <td className="px-4 py-3 text-center">
                    {t.coordinated_pattern ? (
                      <span
                        className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] font-bold inline-flex items-center gap-1"
                        title="SOUL.md §11: Coordinated pattern detected via burst velocity + user/volume ratio"
                      >
                        <AlertTriangle className="w-3 h-3" /> COORDINATED PATTERN
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[10px]">ORGANIC</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
