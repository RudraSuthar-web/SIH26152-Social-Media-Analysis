import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { OverviewMetrics, CanonicalEvent, TrendTopic, ApiMeta } from '../types';
import { MetricCard } from '../components/common/MetricCard';
import { DataSourceBadge } from '../components/common/DataSourceBadge';
import { CsvExportButton } from '../components/common/CsvExportButton';
import { Activity, MessageSquare, Users, TrendingUp, ShieldCheck, Flame, ChevronRight, Copy, Check } from 'lucide-react';

export const OverviewPage: React.FC = () => {
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
  const [events, setEvents] = useState<CanonicalEvent[]>([]);
  const [trends, setTrends] = useState<TrendTopic[]>([]);
  const [meta, setMeta] = useState<ApiMeta | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    apiService.getOverview().then((res) => {
      setMetrics(res.data);
      setMeta(res.meta);
    });
    apiService.getCanonicalEvents().then((res) => setEvents(res.data));
    apiService.getTrends().then((res) => setTrends(res.data));
  }, []);

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!metrics) return null;

  return (
    <div className="space-y-6" role="region" aria-label="Social Media Intelligence Overview">
      {/* Overview Banner (SOUL.md §21 Compliant) */}
      <div className="panel-card p-6 border-l-4 border-l-cyan-400 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-white tracking-tight">Social Media Intelligence Overview</h2>
            {meta && <DataSourceBadge source={meta.data_source} />}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time canonical ingestion and analytics across X and Telegram for NTRO / SIH 2026.
          </p>
        </div>

        {meta && (
          <div className="flex items-center gap-3">
            <CsvExportButton data={events} filename="canonical_events_stream.csv" meta={meta} />
            <div className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-2">
              <span>Request ID: <strong className="text-cyan-400">{meta.request_id}</strong></span>
            </div>
          </div>
        )}
      </div>

      {/* SOUL.md §21 Required Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Events (24h)"
          value={metrics.total_events_24h.toLocaleString()}
          change={`+${metrics.events_trend_pct}%`}
          subtitle="Canonical Ingestion"
          icon={<MessageSquare className="w-5 h-5" />}
          accentColor="cyan"
        />

        <MetricCard
          title="Active Accounts (24h)"
          value={metrics.active_accounts_24h.toLocaleString()}
          subtitle="Pseudonymized Entities"
          icon={<Users className="w-5 h-5" />}
          accentColor="purple"
        />

        <MetricCard
          title="Rising Trends"
          value={metrics.trending_topics_count}
          subtitle="Active Accelerating Topics"
          icon={<TrendingUp className="w-5 h-5" />}
          accentColor="emerald"
        />

        <MetricCard
          title="Adapter Reachability"
          value={`X: ${metrics.adapter_health.x.toUpperCase()}`}
          subtitle={`TG: ${metrics.adapter_health.telegram.toUpperCase()}`}
          icon={<Activity className="w-5 h-5" />}
          accentColor="amber"
        />
      </div>

      {/* Main Grid: Live Canonical Feed + Top Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Event Stream (2 Cols) */}
        <div className="lg:col-span-2 panel-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400 animate-pulse" /> Live Ingestion Event Stream
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Auditable events with full event_id provenance</p>
            </div>
            <div className="flex items-center gap-3">
              {meta && <CsvExportButton data={events} filename="event_stream.csv" meta={meta} />}
              <span className="text-xs font-mono text-cyan-400 font-semibold bg-cyan-950 px-2.5 py-1 rounded-full border border-cyan-800/50">
                {events.length} Events Active
              </span>
            </div>
          </div>

          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {events.map((evt) => (
              <div
                key={evt.event_id}
                tabIndex={0}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/30 transition-all space-y-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-slate-800 text-slate-200 uppercase font-bold text-[10px] border border-slate-700">
                      {evt.platform}
                    </span>
                    <span className="text-slate-400 font-semibold">User: {evt.source_user_id}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-[10px]">{new Date(evt.event_timestamp).toLocaleTimeString()}</span>
                    <button
                      onClick={() => handleCopy(evt.event_id)}
                      className="p-1 text-slate-400 hover:text-white focus:ring-2 focus:ring-cyan-400 focus:outline-none rounded"
                      title="Copy Event ID"
                      aria-label="Copy event ID to clipboard"
                    >
                      {copiedId === evt.event_id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-200 font-sans leading-relaxed">{evt.text}</p>

                {evt.translated_text && (
                  <p className="text-xs text-cyan-300/90 italic bg-cyan-950/30 p-2 rounded border border-cyan-900/40">
                    Translation: "{evt.translated_text}"
                  </p>
                )}

                <div className="flex items-center justify-between text-[11px] font-mono pt-1 text-slate-400">
                  <div className="flex items-center gap-3">
                    <span>Lang: <strong className="text-slate-200">{evt.language.toUpperCase()}</strong></span>
                    {evt.sentiment && (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        evt.sentiment === 'positive' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                        evt.sentiment === 'negative' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                      }`}>
                        {evt.sentiment.toUpperCase()} ({(evt.sentiment_confidence! * 100).toFixed(0)}%)
                      </span>
                    )}
                  </div>
                  <span className="text-slate-500">Model: {evt.model_info?.name || 'xlm-roberta'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Trends (1 Col) */}
        <div className="panel-card p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" /> Top Accelerating Narratives
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Ranked by velocity score</p>
              </div>
            </div>

            <div className="space-y-3">
              {trends.map((t) => (
                <div
                  key={t.topic_id}
                  className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white font-mono">{t.topic_label}</h4>
                    <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                      +{Math.round(t.growth_rate * 100)}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                    <span>Vol: {t.volume.toLocaleString()}</span>
                    <span>Score: <strong className="text-cyan-400">{t.trend_score.toFixed(1)}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-xs font-mono text-slate-400">
            <span className="text-cyan-400 font-bold">SOUL.md Auditability:</span> All predictions include preprocessing version & confidence intervals.
          </div>
        </div>
      </div>
    </div>
  );
};
