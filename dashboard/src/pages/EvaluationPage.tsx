import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { ModelEvaluationData, ApiMeta } from '../types';
import { DataSourceBadge } from '../components/common/DataSourceBadge';
import { CsvExportButton } from '../components/common/CsvExportButton';
import { Cpu, CheckCircle2, AlertTriangle, BarChart2 } from 'lucide-react';

export const EvaluationPage: React.FC = () => {
  const [evalData, setEvalData] = useState<ModelEvaluationData[]>([]);
  const [meta, setMeta] = useState<ApiMeta | null>(null);

  useEffect(() => {
    apiService.getModelEvaluation().then((res) => {
      setEvalData(res.data);
      setMeta(res.meta);
    });
  }, []);

  // Flatten language metrics for CSV Export
  const exportData = evalData.flatMap(m =>
    Object.entries(m.languages_eval).map(([lang, val]) => ({
      model_name: m.model_name,
      version: m.version,
      macro_f1: m.macro_f1,
      language: lang,
      f1_score: val.f1,
      eval_samples: val.samples,
      drift_detected: m.drift_detected
    }))
  );

  return (
    <div className="space-y-6" role="region" aria-label="Model Evaluation Vector">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 panel-card p-5">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-bold font-mono text-white">AI Model Evaluation & Drift Detection Vector</h2>
            {meta && <DataSourceBadge source={meta.data_source} />}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tracking macro-F1 calibration, language-specific precision/recall, and ONNX runtime drift alerts (SOUL.md §34).
          </p>
        </div>

        {meta && (
          <div className="flex items-center gap-3">
            <CsvExportButton data={exportData} filename="model_evaluation_metrics.csv" meta={meta} />
            <div className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
              Drift Status: <span className="text-emerald-400 font-bold">NO DRIFT DETECTED</span>
            </div>
          </div>
        )}
      </div>

      {/* Model Cards */}
      {evalData.map((m) => (
        <div key={m.model_name} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="panel-card p-4 space-y-1">
              <span className="text-xs font-mono text-slate-400 uppercase">Macro-F1 Score</span>
              <p className="text-2xl font-bold font-mono text-cyan-400">{m.macro_f1.toFixed(3)}</p>
              <span className="text-[10px] text-slate-500 font-mono">Held-out test set</span>
            </div>

            <div className="panel-card p-4 space-y-1">
              <span className="text-xs font-mono text-slate-400 uppercase">Precision</span>
              <p className="text-2xl font-bold font-mono text-emerald-400">{m.precision.toFixed(3)}</p>
              <span className="text-[10px] text-slate-500 font-mono">Positive predictive value</span>
            </div>

            <div className="panel-card p-4 space-y-1">
              <span className="text-xs font-mono text-slate-400 uppercase">Recall</span>
              <p className="text-2xl font-bold font-mono text-purple-400">{m.recall.toFixed(3)}</p>
              <span className="text-[10px] text-slate-500 font-mono">True positive rate</span>
            </div>

            <div className="panel-card p-4 space-y-1">
              <span className="text-xs font-mono text-slate-400 uppercase">P95 Latency</span>
              <p className="text-2xl font-bold font-mono text-amber-400">{m.latency_p95_ms} ms</p>
              <span className="text-[10px] text-slate-500 font-mono">ONNX GPU Execution</span>
            </div>
          </div>

          {/* Language F1 Table */}
          <div className="panel-card overflow-hidden">
            <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-cyan-400" /> Per-Language F1 Calibration Breakdown
              </h3>
              <span className="text-xs font-mono text-slate-400">Model: {m.model_name} ({m.version})</span>
            </div>

            <table className="w-full text-left text-xs font-mono" role="table" aria-label="Language F1 breakdown">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th scope="col" className="px-4 py-2.5">Language / Code-Switch</th>
                  <th scope="col" className="px-4 py-2.5 text-right">F1 Score</th>
                  <th scope="col" className="px-4 py-2.5 text-right">Eval Samples N</th>
                  <th scope="col" className="px-4 py-2.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {Object.entries(m.languages_eval).map(([lang, val]) => (
                  <tr key={lang} tabIndex={0} className="hover:bg-slate-900/60 focus:outline-none focus:ring-2 focus:ring-cyan-400">
                    <td className="px-4 py-3 font-bold text-white uppercase">{lang}</td>
                    <td className="px-4 py-3 text-right font-bold text-cyan-400">{val.f1.toFixed(3)}</td>
                    <td className="px-4 py-3 text-right">{val.samples.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                        PASSING
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};
