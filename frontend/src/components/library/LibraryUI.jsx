import React from 'react';

export const Spinner = () => (
  <div className="flex justify-center items-center py-16">
    <div className="animate-spin h-10 w-10 rounded-full border-4 border-indigo-600 border-t-transparent"/>
  </div>
);

export const EmptyState = ({ msg }) => (
  <div className="text-center py-16 text-slate-400">
    <p className="text-4xl mb-3">📭</p>
    <p className="font-semibold">{msg}</p>
  </div>
);