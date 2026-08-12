import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const ErrorState = ({ message = 'Failed to load weather data.', onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-amber-50/50 border border-amber-200/80 rounded-2xl text-center shadow-sm my-4">
      <div className="p-3 bg-amber-100 text-amber-700 rounded-full mb-3">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-1">Service Unavailable</h3>
      <p className="text-sm text-slate-600 max-w-md mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm transition shadow-sm"
        >
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorState;
