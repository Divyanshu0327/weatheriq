import React from 'react';
import { Lightbulb, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

const WeatherIntelligenceCard = ({ intelligence }) => {
  if (!intelligence) return null;

  const { summary, recommendations = [], warnings = [] } = intelligence;

  return (
    <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm card-hover">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl border border-amber-200/60">
          <Lightbulb className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 font-heading">WeatherIQ Intelligence Engine</h3>
          <p className="text-xs text-slate-500">Actionable rule-based health & safety suggestions</p>
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 text-sm font-medium text-slate-700 mb-4">
          {summary}
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="mb-4 space-y-2">
          {warnings.map((warn, i) => (
            <div key={i} className="flex items-start gap-2.5 p-3 bg-rose-50 border border-rose-200/80 rounded-xl text-xs font-semibold text-rose-800">
              <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{warn}</span>
            </div>
          ))}
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Smart Advice</p>
          {recommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-2.5 p-3 bg-blue-50/60 border border-blue-100 rounded-xl text-xs font-medium text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>{rec}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WeatherIntelligenceCard;
