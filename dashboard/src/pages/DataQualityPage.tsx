import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { AdapterHealth, ModelHealth, DeadLetterEntry, ApiMeta } from '../types';
import { DataSourceBadge } from '../components/common/DataSourceBadge';
import { Activity, ShieldAlert, Cpu, RefreshCw, CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';

export const DataQualityPage: React.FC = () => {
  const [adapters, setAdapters] = useState<AdapterHealth[]>([]);
  const [models, setModels] = useState<ModelHealth[]>([]);
  const [deadLetters, setDeadLetters] = useState<DeadLetterEntry[]>([]);
  const [meta, setMeta] = useState<ApiMeta | null>(null);

  useEffect(() => {
    apiService.getAdapterHealth().then((res) => {
      setAdapters(res.data);
      setMeta(res.meta);
    });
    apiService.getModelHealth().then((res) => setModels(res.data));
    apiService.getDeadLetters().then((res) => setDeadLetters(res.data));
  }, []);

  // SOUL.md §23 Computed System Status Rule
  const computeSystemStatus = () => {
    if (adapters.some(a => a.status === 'down')) return { label: 'CRITICAL', color: 'text-rose-400 border-rose-500/30 bg-rose-500/10' };
    if (adapters.some(a => a.status === 'degraded') || models.some(m => m.error_rate_pct > 0.01)) {
      return { label: 'DEGRADED', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' };
    }
    return { label: 'HEALTHY', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' };
  };

  const sysStatus = computeSystemStatus();

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 panel-card p-5">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold font-mono text-white">Data Sentinel & Telemetry Control Vector</h2>
            {meta && <DataSourceBadge source={meta.data_source} />}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Monitoring API rate limits, adapter lag ($\Delta t$), Dead-Letter Quarantine (DLQ), and model inference latency (SOUL.md §23).
          </p>
        </div>

        <div className={`px-3.5 py-1.5 rounded-lg border font-mono text-xs font-bold flex items-center gap-2 ${sysStatus.color}`}>
          <CheckCircle2 className="w-4 h-4" />
          <span>System Status: {sysStatus.label}</span>
        </div>
      </div>

      {/* Adapter Telemetry Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        {adapters.map((a) => (
          <div
            key={a.platform}
            className={`panel-card p-4 space-y-3 ${
              a.status === 'healthy' ? '' : 'border-amber-500/40 bg-amber-950/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-white uppercase">{a.platform} Adapter</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                  a.status === 'healthy'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                }`}
              >
                {a.status}
              </span>
            </div>

            <div className="space-y-1.5 font-mono text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Lag ($\Delta t$):</span>
                <span className="font-bold text-white">{a.lag_seconds}s</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Quota Usage:</span>
                <span className={a.rate_limit_usage_pct > 75 ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                  {a.rate_limit_usage_pct}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">24h Ingest Volume:</span>
                <span>{a.events_ingested_24h.toLocaleString()}</span>
              </div>
            </div>

            {/* Meter Bar */}
            <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full ${a.rate_limit_usage_pct > 75 ? 'bg-amber-400' : 'bg-cyan-400'}`}
                style={{ width: `${a.rate_limit_usage_pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Model Health Section */}
      <div className="panel-card p-5 space-y-4">
        <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-purple-400" /> ONNX Model Runtime Telemetry
          </h3>
          <span className="text-xs font-mono text-slate-400">CUDA / CPU Execution</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {models.map((m) => (
            <div key={m.model_name} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-xs">{m.model_name}</h4>
                <span className="text-[10px] text-emerald-400 font-bold uppercase">{m.status}</span>
              </div>

              <p className="text-[11px] text-slate-400">Version: {m.version}</p>

              <div className="pt-2 border-t border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-slate-300">
                  <span>P95 Latency:</span>
                  <strong className="text-cyan-400">{m.p95_latency_ms} ms</strong>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>P99 Latency:</span>
                  <strong className="text-purple-400">{m.p99_latency_ms} ms</strong>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Error Rate:</span>
                  <span className="text-emerald-400">{m.error_rate_pct}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dead Letter Queue (DLQ) Manager */}
      <div className="panel-card overflow-hidden">
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" /> Dead-Letter Queue (DLQ) Quarantine (SOUL.md §6)
          </h3>
          <span className="text-xs font-mono text-slate-400">{deadLetters.length} Quarantined Payloads</span>
        </div>

        <div className="divide-y divide-slate-800/60 font-mono text-xs">
          {deadLetters.map((dlq) => (
            <div key={dlq.id} className="p-4 hover:bg-slate-900/50 transition-colors space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4 text-rose-400" />
                  <span className="font-bold text-white uppercase">{dlq.platform} • {dlq.error_code}</span>
                </div>
                <span className="text-[10px] text-slate-500">{new Date(dlq.received_at).toLocaleTimeString()}</span>
              </div>

              <p className="text-slate-300 text-xs font-sans bg-rose-950/20 p-2.5 rounded border border-rose-900/30">
                Error: {dlq.error_message}
              </p>

              <div className="flex items-center justify-between pt-1">
                <code className="text-[10px] text-slate-400 bg-slate-950 px-2 py-1 rounded truncate max-w-lg">
                  {dlq.raw_payload_snippet}
                </code>

                <button className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-mono inline-flex items-center gap-1 transition-colors">
                  <RefreshCw className="w-3 h-3" /> Replay Payload
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
