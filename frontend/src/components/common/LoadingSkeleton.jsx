import React from 'react';

const LoadingSkeleton = ({ type = 'card', count = 1 }) => {
  const items = Array.from({ length: count });

  if (type === 'chart') {
    return (
      <div className="w-full h-64 bg-slate-100 animate-pulse rounded-xl p-4 flex flex-col justify-between border border-slate-200">
        <div className="h-6 w-1/3 bg-slate-200 rounded"></div>
        <div className="h-40 w-full bg-slate-200/60 rounded"></div>
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="w-full space-y-3">
        {items.map((_, i) => (
          <div key={i} className="h-12 bg-slate-100 animate-pulse rounded-lg w-full"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
      {items.map((_, i) => (
        <div key={i} className="h-48 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm animate-pulse flex flex-col justify-between">
          <div className="space-y-3">
            <div className="h-5 w-2/3 bg-slate-200 rounded"></div>
            <div className="h-4 w-1/2 bg-slate-200/70 rounded"></div>
          </div>
          <div className="h-8 w-1/3 bg-slate-300 rounded"></div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
