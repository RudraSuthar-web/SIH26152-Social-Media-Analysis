import React from 'react';

export const PageSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse" role="status" aria-label="Loading page analytics data">
      {/* Banner Skeleton */}
      <div className="h-20 bg-slate-900/80 rounded-2xl border border-slate-800 w-full" />

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 bg-slate-900/80 rounded-2xl border border-slate-800 p-4 space-y-3">
            <div className="h-4 bg-slate-800 rounded w-1/2" />
            <div className="h-8 bg-slate-800 rounded w-3/4" />
          </div>
        ))}
      </div>

      {/* Chart & Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-72 bg-slate-900/80 rounded-2xl border border-slate-800 p-5 space-y-4">
          <div className="h-5 bg-slate-800 rounded w-1/3" />
          <div className="h-48 bg-slate-800/60 rounded-xl w-full" />
        </div>
        <div className="h-72 bg-slate-900/80 rounded-2xl border border-slate-800 p-5 space-y-4">
          <div className="h-5 bg-slate-800 rounded w-1/2" />
          <div className="h-48 bg-slate-800/60 rounded-xl w-full" />
        </div>
      </div>
    </div>
  );
};
