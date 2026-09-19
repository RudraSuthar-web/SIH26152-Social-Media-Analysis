import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { DemographicAggregate, ApiMeta } from '../types';
import { BarChart } from '../components/charts/BarChart';
import { LeafletGeoMap } from '../components/charts/LeafletGeoMap';
import { AgeLanguageStackedBar } from '../components/charts/demographics/AgeLanguageStackedBar';
import { InterestPlatformHeatmap } from '../components/charts/demographics/InterestPlatformHeatmap';
import { DataSourceBadge } from '../components/common/DataSourceBadge';
import { Modal } from '../components/common/Modal';
import { CsvExportButton } from '../components/common/CsvExportButton';
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

  // Flatten demographics data for CSV Export
  const exportData = [
    ...Object.entries(demo.age_brackets).map(([bracket, val]) => ({
      category: 'age_bracket',
      key: `${bracket} years`,
      percentage: `${Math.round(val * 100)}%`,
      ci_low: demo.age_confidence_intervals?.[bracket] ? `${Math.round(demo.age_confidence_intervals[bracket][0] * 100)}%` : 'N/A',
      ci_high: demo.age_confidence_intervals?.[bracket] ? `${Math.round(demo.age_confidence_intervals[bracket][1] * 100)}%` : 'N/A'
    })),
    ...Object.entries(demo.geography).map(([region, val]) => ({
      category: 'geography',
      key: region,
      percentage: `${Math.round(val * 100)}%`,
      ci_low: 'N/A',
      ci_high: 'N/A'
    })),
    ...Object.entries(demo.languages).map(([lang, val]) => ({
      category: 'language',
      key: lang,
      percentage: `${Math.round(val * 100)}%`,
      ci_low: 'N/A',
      ci_high: 'N/A'
    }))
  ];

  return (
    <div className="space-y-6" role="region" aria-label="Demographics Vector">
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
          {meta && <CsvExportButton data={exportData} filename="demographics_aggregate.csv" meta={meta} />}

          <button
            onClick={() => setShowMethodology(true)}
            className="btn-secondary text-xs font-mono focus:ring-2 focus:ring-cyan-400 focus:outline-none"
            aria-label="Open demographic inference methodology modal"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" /> How Inferred?
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
        {/* Age Brackets with Error Whisker Bars */}
        <div className="panel-card p-5 space-y-4">
          <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-cyan-400" /> Age Bracket Distribution (± Confidence Intervals)
            </h3>
            <span className="text-[11px] font-mono text-slate-500">Aggregate Inferred</span>
          </div>

          <BarChart
            data={demo.age_brackets}
            colorScheme="blue"
            confidenceIntervals={demo.age_confidence_intervals}
          />
        </div>

        {/* Regional Geography Leaflet Map */}
        <div className="panel-card p-5 space-y-4">
          <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" /> Geospatial & State Concentration Map
            </h3>
            <span className="text-[11px] font-mono text-slate-500">PostGIS Density</span>
          </div>

          <LeafletGeoMap data={demo.geography} />
        </div>
      </div>

      {/* Expanded Charts Row (CHART_EXPANSION.md) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AgeLanguageStackedBar requestId={meta?.request_id} />
        <InterestPlatformHeatmap requestId={meta?.request_id} />
      </div>

      {/* Methodology Inspector Modal */}
      {showMethodology && (
        <Modal
          isOpen={showMethodology}
          onClose={() => setShowMethodology(false)}
          title="Demographic Inference Methodology & Privacy Protocols"
        >
          <div className="space-y-4 font-mono text-xs text-slate-300">
            <div className="p-3 bg-cyan-950/40 border border-cyan-800/50 rounded-xl space-y-1">
              <p className="text-cyan-300 font-bold">SOUL.md §12 Compliance & Privacy Mandate:</p>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Raw user profile metadata and individual PII are scrubbed immediately during the ingestion normalization stage.
                Demographic distributions are strictly computed using statistical aggregate heuristics over N={demo.sample_size.toLocaleString()} events.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider">Inference Signals & Rules:</h4>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
                {demo.methodology_notes.map((note, idx) => (
                  <li key={idx} className="leading-relaxed">{note}</li>
                ))}
              </ul>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-between text-[11px] text-slate-400">
              <span>Confidence Label: <strong className="text-emerald-400 uppercase">{demo.confidence_label}</strong></span>
              <span>Sample Window: {demo.window}</span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
