import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  Building2, 
  Filter, 
  ArrowRight, 
  CopyCheck, 
  Edit3,
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { CATEGORIES, SEVERITIES, STATUS_CONFIG, formatRelativeTime } from '../utils/helpers';

export default function AdminPanel({ 
  issues, 
  onSelectIssue, 
  onQuickUpdateStatus, 
  onQuickReclassify, 
  onQuickAssign 
}) {
  const [triageFilter, setTriageFilter] = useState('needs_triage'); // 'all', 'needs_triage', 'critical', 'duplicates', 'in_progress', 'resolved'

  const filteredIssues = issues.filter(issue => {
    if (triageFilter === 'needs_triage') {
      return issue.status === 'submitted' || issue.status === 'under_review';
    }
    if (triageFilter === 'critical') {
      return (issue.severity === 'critical' || issue.severity === 'high') && issue.status !== 'resolved';
    }
    if (triageFilter === 'duplicates') {
      return issue.duplicate_status === 'flagged';
    }
    if (triageFilter === 'in_progress') {
      return issue.status === 'in_progress' || issue.status === 'assigned';
    }
    if (triageFilter === 'resolved') {
      return issue.status === 'resolved';
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Admin Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-civic-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-civic-500/20 text-civic-300 border border-civic-500/30 mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-civic-400" />
            Staff Authorization Mode Active
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            Municipal Dispatch & Evidence Review Center
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Verify AI diagnostics, rectify misclassifications, manage duplicates, and assign field maintenance crews to ensure evidence-backed resolution.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 w-64 h-64 bg-civic-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Triage Queue Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-xs">
        <button
          onClick={() => setTriageFilter('needs_triage')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            triageFilter === 'needs_triage'
              ? 'bg-civic-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4 text-amber-400" />
          <span>Needs Initial Triage</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[11px] bg-white/20 text-white">
            {issues.filter(i => i.status === 'submitted' || i.status === 'under_review').length}
          </span>
        </button>

        <button
          onClick={() => setTriageFilter('critical')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            triageFilter === 'critical'
              ? 'bg-rose-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-rose-500" />
          <span>High & Critical Priority</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[11px] bg-white/20 text-white">
            {issues.filter(i => (i.severity === 'critical' || i.severity === 'high') && i.status !== 'resolved').length}
          </span>
        </button>

        <button
          onClick={() => setTriageFilter('duplicates')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            triageFilter === 'duplicates'
              ? 'bg-indigo-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CopyCheck className="w-4 h-4 text-indigo-400" />
          <span>Flagged Duplicates</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[11px] bg-white/20 text-white">
            {issues.filter(i => i.duplicate_status === 'flagged').length}
          </span>
        </button>

        <button
          onClick={() => setTriageFilter('in_progress')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            triageFilter === 'in_progress'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Assigned & In Progress</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[11px] bg-white/20 text-white">
            {issues.filter(i => i.status === 'in_progress' || i.status === 'assigned').length}
          </span>
        </button>

        <button
          onClick={() => setTriageFilter('resolved')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            triageFilter === 'resolved'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Resolved</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[11px] bg-white/20 text-white">
            {issues.filter(i => i.status === 'resolved').length}
          </span>
        </button>

        <button
          onClick={() => setTriageFilter('all')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            triageFilter === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>All Records ({issues.length})</span>
        </button>
      </div>

      {/* Staff Review Table / Queue */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">
              Active Triage Queue ({filteredIssues.length} reports)
            </h3>
            <p className="text-xs text-slate-500">
              Review AI preliminary tags and dispatch maintenance work orders.
            </p>
          </div>
        </div>

        {filteredIssues.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-500 opacity-60" />
            <h4 className="text-base font-bold text-slate-700 mb-1">Queue is Clear!</h4>
            <p className="text-xs">No civic reports match this filter criteria.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filteredIssues.map((issue) => {
              const cat = CATEGORIES[issue.category] || CATEGORIES.potholes;
              const sevCfg = SEVERITIES[issue.severity] || SEVERITIES.medium;
              const statusCfg = STATUS_CONFIG[issue.status] || STATUS_CONFIG.submitted;
              const isDupe = issue.duplicate_status === 'flagged';

              return (
                <div 
                  key={issue.id}
                  className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
                >
                  
                  {/* Left info: Image, Title, ID, Category, Address */}
                  <div className="flex items-start gap-4 flex-1">
                    <img
                      src={issue.image_url}
                      alt={issue.title}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-200 shrink-0 cursor-pointer"
                      onClick={() => onSelectIssue(issue)}
                    />

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-extrabold text-xs text-civic-700 bg-civic-50 px-2 py-0.5 rounded border border-civic-200">
                          #{issue.id}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${cat.badgeClass}`}>
                          {cat.shortLabel}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${sevCfg.badgeClass}`}>
                          {sevCfg.label}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusCfg.badgeClass}`}>
                          {statusCfg.label}
                        </span>
                        {isDupe && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                            Duplicate Flagged
                          </span>
                        )}
                      </div>

                      <h4 
                        onClick={() => onSelectIssue(issue)}
                        className="text-sm sm:text-base font-bold text-slate-900 hover:text-civic-700 transition-colors cursor-pointer"
                      >
                        {issue.title}
                      </h4>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span>📍 {issue.address}</span>
                        <span>•</span>
                        <span>Reported {formatRelativeTime(issue.created_at)}</span>
                        <span>•</span>
                        <span className="text-civic-700 font-semibold">
                          🏛️ {issue.assigned_department || 'Unassigned'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right quick staff action buttons */}
                  <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                    
                    {issue.status === 'submitted' && (
                      <button
                        onClick={() => onQuickUpdateStatus(issue.id, 'under_review', 'Triage review commenced by staff dispatcher.')}
                        className="px-3 py-1.5 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl border border-purple-200 transition-colors"
                      >
                        Start Review →
                      </button>
                    )}

                    {issue.status === 'under_review' && (
                      <button
                        onClick={() => onQuickUpdateStatus(issue.id, 'assigned', 'Dispatched to specialized municipal maintenance crew.')}
                        className="px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition-colors"
                      >
                        Assign Crew →
                      </button>
                    )}

                    {issue.status === 'assigned' && (
                      <button
                        onClick={() => onQuickUpdateStatus(issue.id, 'in_progress', 'Crew mobilized on-site for remediation.')}
                        className="px-3 py-1.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-200 transition-colors"
                      >
                        Mark In Progress →
                      </button>
                    )}

                    {issue.status === 'in_progress' && (
                      <button
                        onClick={() => onSelectIssue(issue)}
                        className="px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-colors"
                      >
                        Submit Resolution Proof →
                      </button>
                    )}

                    <button
                      onClick={() => onSelectIssue(issue)}
                      className="p-2 text-slate-500 hover:text-civic-700 hover:bg-slate-100 rounded-xl transition-colors"
                      title="Inspect full evidence modal"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>

                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
