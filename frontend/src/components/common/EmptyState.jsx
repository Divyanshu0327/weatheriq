import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({ title = 'No Data Found', message = 'There are no items to display.', actionLabel, onAction, icon: Icon = Inbox }) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 bg-white border border-slate-200/80 rounded-2xl text-center shadow-sm my-4">
      <div className="p-4 bg-slate-100 text-slate-500 rounded-full mb-4">
        <Icon className="w-10 h-10" />
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm transition shadow-sm"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
