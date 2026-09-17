import React from 'react';
import { Download } from 'lucide-react';
import { ApiMeta } from '../../types';

interface CsvExportButtonProps<T> {
  data: T[];
  filename: string;
  meta?: ApiMeta;
}

export const CsvExportButton = <T extends Record<string, any>>({
  data,
  filename,
  meta
}: CsvExportButtonProps<T>) => {
  const handleExport = () => {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]);
    const metaHeader = meta
      ? `# Metadata: RequestID=${meta.request_id}, Timestamp=${meta.timestamp}, DataSource=${meta.data_source}\n`
      : '';

    const rows = data.map((row) =>
      headers
        .map((header) => {
          const val = row[header];
          const escaped = (typeof val === 'object' ? JSON.stringify(val) : String(val ?? '')).replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(',')
    );

    const csvContent = `${metaHeader}${headers.join(',')}\n${rows.join('\n')}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleExport}
      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors text-xs font-mono inline-flex items-center gap-1.5"
      title="Export dataset as CSV"
    >
      <Download className="w-3.5 h-3.5 text-cyan-400" /> Export CSV
    </button>
  );
};
