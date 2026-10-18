import React from 'react';
import { 
  FileText, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  CopyCheck, 
  TrendingUp,
  Activity,
  Flame
} from 'lucide-react';

export default function StatsOverview({ analytics, onFilterDuplicates, onFilterStatus }) {
  if (!analytics) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4 mb-6">
      
      {/* 1. Total Reports */}
      <div 
        onClick={() => onFilterStatus && onFilterStatus('all')}
        className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/90 shadow-xs hover:border-civic-300 transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider">Total Reports</span>
          <div className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-civic-50 group-hover:text-civic-600 transition-colors">
            <FileText className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {analytics.total_reports || 0}
          </span>
          <span className="text-[11px] font-medium text-emerald-600 flex items-center">
            <TrendingUp className="w-3 h-3 mr-0.5" /> 100% tracked
          </span>
        </div>
      </div>

      {/* 2. Unresolved / Triage Queue */}
      <div 
        onClick={() => onFilterStatus && onFilterStatus('under_review')}
        className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/90 shadow-xs hover:border-amber-300 transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider">Unresolved</span>
          <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-600">
            {analytics.unresolved_reports || 0}
          </span>
          <span className="text-[11px] font-medium text-slate-400">
            in queue
          </span>
        </div>
      </div>

      {/* 3. In Progress */}
      <div 
        onClick={() => onFilterStatus && onFilterStatus('in_progress')}
        className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/90 shadow-xs hover:border-blue-300 transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider">In Progress</span>
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
            <Activity className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl sm:text-3xl font-extrabold text-blue-600">
            {analytics.in_progress_reports || 0}
          </span>
          <span className="text-[11px] font-medium text-blue-600">
            field crews active
          </span>
        </div>
      </div>

      {/* 4. Resolved */}
      <div 
        onClick={() => onFilterStatus && onFilterStatus('resolved')}
        className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/90 shadow-xs hover:border-emerald-300 transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider">Resolved</span>
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
            {analytics.resolved_reports || 0}
          </span>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
            {analytics.resolution_rate}% rate
          </span>
        </div>
      </div>

      {/* 5. Avg Resolution Time */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider">Avg Resolution</span>
          <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {analytics.avg_resolution_hours}
            <span className="text-sm font-semibold text-slate-500 ml-1">hrs</span>
          </span>
          <span className="text-[11px] font-medium text-slate-400">
            target: &lt;48h
          </span>
        </div>
      </div>

      {/* 6. Flagged Duplicates */}
      <div 
        onClick={() => onFilterDuplicates && onFilterDuplicates()}
        className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/90 shadow-xs hover:border-indigo-300 transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider">Duplicates Flagged</span>
          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
            <CopyCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl sm:text-3xl font-extrabold text-indigo-600">
            {analytics.flagged_duplicates_count || 0}
          </span>
          <span className="text-[11px] font-medium text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
            auto-grouped
          </span>
        </div>
      </div>

    </div>
  );
}
