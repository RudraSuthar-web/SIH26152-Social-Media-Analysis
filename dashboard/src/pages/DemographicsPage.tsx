import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { DemographicAggregate, ApiMeta } from '../types';
import { BarChart } from '../components/charts/BarChart';
import { DataSourceBadge } from '../components/common/DataSourceBadge';
import { Modal } from '../components/common/Modal';
import { Users, Shield, MapPin, Globe, Award, HelpCircle } from 'lucide-react';

export const DemographicsPage: React.FC = () => {
  const [demo, setDemo] = useState<DemographicAggregate | null>(null);
  const [meta, setMeta] = useState<ApiMeta | null>(null);
  const [showMethodology, setShowMethodology] = useState(false);

  useEffect(() => {
    apiService.getDemographics().then((res) => {
      setDemo(res.data);
      setMeta(res.meta);
    });
  }, []);

  if (!demo) return null;

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 panel-card p-5">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-bold font-mono text-white">Aggregate Demographic Profiling Vector</h2>
            {meta && <DataSourceBadge source={meta.data_source} />}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Privacy-conscious, aggregate-only inference signals (SOUL.md §12 — strictly no individual PII).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMethodology(true)}
            className="btn-secondary text-xs font-mono"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" /> Methodology
          </button>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-300 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Confidence: <strong className="text-emerald-400 uppercase">{demo.confidence_label}</strong></span>
            <span className="text-slate-500">•</span>
            <span>N={demo.sample_size.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Main Demographics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Age Brackets with Confidence Intervals */}
        <div className="panel-card p-5 space-y-4">
          <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-cyan-400" /> Age Bracket Distribution (± Error Bars)
            </h3>
            <span className="text-[11px] font-mono text-slate-500">Aggregate Inferred</span>
          </div>

          <div className="space-y-3">
            {Object.entries(demo.age_brackets).map(([bracket, ratio]) => {
              const ci = demo.age_confidence_intervals ? demo.age_confidence_intervals[bracket] : [ratio - 0.02, ratio + 0.02];
              const pct = Math.round(ratio * 100);
              const ciLow = Math.max(0, Math.round((ci[0] || ratio - 0.02) * 100));
              const ciHigh = Math.min(100, Math.round((ci[1] || ratio + 0.02) * 100));

              return (
                <div key={bracket} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300">{bracket} years</span>
                    <span className="text-slate-400 font-bold">{pct}% <span className="text-[10px] text-slate-500">({ciLow}% - {ciHigh}%)</span></span>
                  </div>
                  <div className="h-3 bg-slate-900 rounded-lg overflow-hidden border border-slate-800 relative">
                    <div className="h-full bg-cyan-500/80 rounded-lg" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Regional Geography */}
        <div className="panel-card p-5 space-y-4">
          <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" /> Geospatial & State Concentration
            </h3>
            <span className="text-[11px] font-mono text-slate-500">PostGIS Density</span>
          </div>

          <BarChart data={demo.geography} colorScheme="emerald" />
        </div>

        {/* Languages & Dialects */}
        <div className="panel-card p-5 space-y-4">
          <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-purple-400" /> Language & Code-Switch Ratios
            </h3>
            <span className="text-[11px] font-mono text-slate-500">fasttext lid.176</span>
          </div>

          <BarChart data={demo.languages} colorScheme="purple" />
        </div>

        {/* Professional Interests */}
        <div className="panel-card p-5 space-y-4">
          <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" /> Audience Interest Clusters
            </h3>
            <span className="text-[11px] font-mono text-slate-500">Bio & Hashtag Signals</span>
          </div>

          <BarChart data={demo.interests} colorScheme="amber" />
        </div>
      </div>

      {/* Methodology Inspector Modal */}
      {showMethodology && (
        <Modal
          isOpen={showMethodology}
          onClose={() => setShowMethodology(false)}
          title="Demographic Inference Methodology & Signals"
        >
          <div className="space-y-3 font-mono text-xs text-slate-300">
            <p className="text-cyan-300 font-bold">SOUL.md §12 Privacy-Conscious Rules:</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              {demo.methodology_notes.map((note, idx) => (
                <li key={idx}>{note}</li>
              ))}
            </ul>
            <p className="text-slate-500 pt-2 border-t border-slate-800">
              Individual PII is strictly deleted at normalization stage. All metrics represent aggregate confidence estimates over N={demo.sample_size.toLocaleString()} posts.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};
