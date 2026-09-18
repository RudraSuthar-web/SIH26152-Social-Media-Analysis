import React, { useState } from 'react';
import { DataSourceBadge } from '../common/DataSourceBadge';
import { CsvExportButton } from '../common/CsvExportButton';
import { ChartContainerProps } from './chart-types';
import { Table, BarChart2, Copy, Check } from 'lucide-react';

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  subtitle,
  dataSource = 'synthetic',
  requestId,
  children,
  exportFilename = 'analytics_chart_data',
  exportData,
  meta,
  className = ''
}) => {
  const [showTableView, setShowTableView] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyReqId = () => {
    if (!requestId) return;
    navigator.clipboard.writeText(requestId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`panel-card p-5 space-y-4 ${className}`} role="region" aria-label={title}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold font-mono text-white">{title}</h3>
            {dataSource && <DataSourceBadge source={dataSource} />}
          </div>
          {subtitle && <p className="text-[11px] text-slate-400 font-mono mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2">
          {/* Table / Chart Toggle */}
          <button
            onClick={() => setShowTableView(!showTableView)}
            className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors text-xs font-mono inline-flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            title="Toggle Accessibility Data Table"
            aria-label="Toggle accessible data table view"
          >
            {showTableView ? <BarChart2 className="w-3.5 h-3.5 text-cyan-400" /> : <Table className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{showTableView ? 'Chart View' : 'Table View'}</span>
          </button>

          {/* Export CSV */}
          {exportData && exportData.length > 0 && (
            <CsvExportButton
              data={exportData}
              filename={exportFilename}
              meta={meta || { request_id: requestId || 'req-local', timestamp: new Date().toISOString(), data_source: dataSource }}
            />
          )}

          {/* Request ID badge */}
          {requestId && (
            <button
              onClick={handleCopyReqId}
              className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800 hover:border-cyan-500/40 transition-all flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              title="Copy Request ID"
            >
              <span>{requestId}</span>
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-500" />}
            </button>
          )}
        </div>
      </div>

      {/* Main Body */}
      {showTableView && exportData && exportData.length > 0 ? (
        <div className="overflow-x-auto max-h-64 border border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs font-mono" role="table">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                {Object.keys(exportData[0]).map((key) => (
                  <th key={key} scope="col" className="px-3 py-2">{key}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {exportData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-900/60">
                  {Object.values(row).map((val: any, vIdx) => (
                    <td key={vIdx} className="px-3 py-2">
                      {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="w-full relative">
          {children}
        </div>
      )}
    </div>
  );
};
