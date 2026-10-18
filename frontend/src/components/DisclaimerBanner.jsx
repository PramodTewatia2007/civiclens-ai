import React, { useState } from 'react';
import { AlertCircle, X, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

export default function DisclaimerBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-500/10 border-b border-amber-200/80 px-4 py-2.5 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2.5 text-amber-900">
          <div className="p-1 rounded-md bg-amber-500/15 text-amber-800 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <p className="font-medium leading-tight">
            <strong className="font-bold text-amber-950">AI Governance Notice:</strong> All automated classifications, severity rankings, and duplicate flags are preliminary suggestions to aid rapid triage. Final assignments and resolution verification are conducted by authorized human staff.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="hidden md:inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-200/60 text-amber-900 border border-amber-300">
            <CheckCircle2 className="w-3 h-3 text-amber-700" />
            Human-in-the-Loop Active
          </span>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-amber-800/70 hover:text-amber-950 hover:bg-amber-200/50 rounded transition-colors"
            title="Dismiss notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
