import React, { useEffect, useState } from 'react';
import { useAnalytics } from '../context/AnalyticsContext';
import { apiService } from '../services/api';
import { SentimentTimePoint, CanonicalEvent, EmotionBreakdown, ApiMeta } from '../types';
import { AreaChart } from '../components/charts/AreaChart';
import { EmotionRadar } from '../components/charts/EmotionRadar';
import { DataSourceBadge } from '../components/common/DataSourceBadge';
import { CsvExportButton } from '../components/common/CsvExportButton';
import { Smile, AlertCircle, Cpu, Languages, Copy, Check } from 'lucide-react';

export const SentimentPage: React.FC = () => {
  const { selectedPlatform, timeRange } = useAnalytics();
  const [timeline, setTimeline] = useState<SentimentTimePoint[]>([]);
  const [events, setEvents] = useState<CanonicalEvent[]>([]);
  const [emotions, setEmotions] = useState<EmotionBreakdown | null>(null);
  const [meta, setMeta] = useState<ApiMeta | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    apiService.getSentimentTimeline(timeRange).then((res) => {
      setTimeline(res.data);
      setMeta(res.meta);
    });
    apiService.getCanonicalEvents(selectedPlatform).then((res) => setEvents(res.data));
    apiService.getEmotionAggregate().then((res) => setEmotions(res.data));
  }, [selectedPlatform, timeRange]);

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 panel-card p-5">
        <div>
          <div className="flex items-center gap-2">
            <Smile className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold font-mono text-white">Multi-Dimensional Sentiment & Emotion Vector</h2>
            {meta && <DataSourceBadge source={meta.data_source} />}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Multilingual sentiment classification (XLM-RoBERTa base) with sarcasm uncertainty flags & code-switched support.
          </p>
        </div>

        {meta && (
          <div className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            Model: <span className="text-cyan-400 font-bold">{meta.model_version || 'v3.1'}</span>
          </div>
        )}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Chart */}
        <div className="lg:col-span-2 panel-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" /> Sentiment Distribution Over Time ({timeRange})
            </h3>
            <span className="text-xs font-mono text-slate-400">Confidence Band Active</span>
          </div>

          <AreaChart data={timeline} height={260} />
        </div>

        {/* Emotion Spectrum Radar */}
        <div className="panel-card p-5 space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
              <Languages className="w-4 h-4 text-purple-400" /> Emotion Vector Spectrum
            </h3>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">Multi-label classification logits</p>
          </div>

          {emotions ? <EmotionRadar emotions={emotions} /> : <div className="text-xs font-mono text-slate-500">Loading emotions...</div>}
        </div>
      </div>

      {/* Auditable Multilingual Feed Inspector */}
      <div className="panel-card p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400" /> Auditable Multilingual Events & Sarcasm Inspector
          </h3>
          
          {meta && <CsvExportButton data={events} filename="sentiment_events" meta={meta} />}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((evt) => (
            <div
              key={evt.event_id}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3"
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-bold uppercase text-[10px]">
                  {evt.platform} • {evt.language.toUpperCase()}
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500">ID: {evt.event_id}</span>
                  <button
                    onClick={() => handleCopy(evt.event_id)}
                    className="p-1 text-slate-400 hover:text-white"
                    title="Copy Event ID"
                  >
                    {copiedId === evt.event_id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              <div>
                <p className="text-xs text-white font-sans font-medium">{evt.text}</p>
                {evt.translated_text && (
                  <p className="text-xs text-cyan-300/80 mt-1.5 italic bg-slate-950 p-2 rounded border border-slate-800">
                    Translation: "{evt.translated_text}"
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>
                  Sentiment: <strong className="text-emerald-400 uppercase">{evt.sentiment}</strong>
                </span>
                <span>Conf: <strong>{((evt.sentiment_confidence || 0.85) * 100).toFixed(0)}%</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
