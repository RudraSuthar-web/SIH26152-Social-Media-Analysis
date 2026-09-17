import React, { ReactNode } from 'react';
import { Header } from './Header';
import { PlatformFilter } from '../common/PlatformFilter';
import { ShieldCheck } from 'lucide-react';

export const Layout: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#050811] flex flex-col font-sans text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      <Header />
      
      <div className="flex-1 max-w-[1600px] w-full mx-auto px-6 py-6 space-y-6">
        {/* Top Control Filter Strip */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/60">
          <PlatformFilter />

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900/60 px-3 py-1 rounded-full border border-slate-800/80">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>PII Safeguard: <strong className="text-emerald-400">ENFORCED</strong></span>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="space-y-6">
          {children}
        </main>
      </div>

      {/* Sleek Minimal Footer */}
      <footer className="border-t border-slate-900 py-4 px-6 text-center text-xs font-mono text-slate-500">
        PS 26152 — AI-Driven Social Media Analytics Framework • National Technical Research Organisation (NTRO) • SIH 2026
      </footer>
    </div>
  );
};
