import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
  if (!message) return null;

  const isSuccess = type === 'success';

  return (
    <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium border transition-all animate-bounce ${
      isSuccess ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
    }`}>
      {isSuccess ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-rose-600" />}
      <span>{message}</span>
      <button onClick={onClose} className="p-1 hover:bg-black/5 rounded-lg text-slate-500">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
