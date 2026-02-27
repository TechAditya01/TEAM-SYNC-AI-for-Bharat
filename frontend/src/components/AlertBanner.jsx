import React from 'react';
import { AlertTriangle } from 'lucide-react';

const AlertBanner = () => {
  return (
    <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800 dark:border-amber-700/40 dark:bg-amber-900/20 dark:text-amber-300">
      <div className="flex items-center gap-2 text-sm font-medium">
        <AlertTriangle size={16} />
        Civic alerts and updates may refresh in real-time.
      </div>
    </div>
  );
};

export default AlertBanner;
