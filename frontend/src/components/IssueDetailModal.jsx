import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Building2, 
  User, 
  CopyCheck, 
  ThumbsUp, 
  ArrowRight,
  ExternalLink,
  Edit3,
  Calendar,
  Layers,
  FileCheck
} from 'lucide-react';
import { 
  CATEGORIES, 
  SEVERITIES, 
  STATUS_CONFIG, 
  STATUS_STEPS, 
  formatDate, 
  formatRelativeTime 
} from '../utils/helpers';
import MapView from './MapView';

export default function IssueDetailModal({ 
  issue, 
  onClose, 
  onUpdateStatus, 
  onUpdateClassification, 
  onUpdateDuplicate, 
  onUpvote, 
  isAdmin 
}) {
  if (!issue) return null;

  const [activeTab, setActiveTab] = useState('trail'); // 'trail', 'ai', 'admin'
  const [newStatus, setNewStatus] = useState(issue.status);
  const [statusNotes, setStatusNotes] = useState('');
  const [assignedDept, setAssignedDept] = useState(issue.assigned_department || '');
  const [assignedPerson, setAssignedPerson] = useState(issue.assigned_person || '');
  const [resNotes, setResNotes] = useState(issue.resolution_notes || '');
  const [resImageUrl, setResImageUrl] = useState(issue.resolution_image_url || '');

  // Reclassification State
  const [isEditingClass, setIsEditingClass] = useState(false);
  const [reclassCategory, setReclassCategory] = useState(issue.category);
  const [reclassSeverity, setReclassSeverity] = useState(issue.severity);
  const [overrideReason, setOverrideReason] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (issue) {
      setNewStatus(issue.status);
      setAssignedDept(issue.assigned_department || '');
      setAssignedPerson(issue.assigned_person || '');
      setResNotes(issue.resolution_notes || '');
      setResImageUrl(issue.resolution_image_url || '');
      setReclassCategory(issue.category);
      setReclassSeverity(issue.severity);
    }
  }, [issue?.id, issue?.status, issue?.category, issue?.severity, issue?.assigned_department, issue?.assigned_person]);

  const cat = CATEGORIES[issue.category] || CATEGORIES.potholes;
  const statusCfg = STATUS_CONFIG[issue.status] || STATUS_CONFIG.submitted;
  const sevCfg = SEVERITIES[issue.severity] || SEVERITIES.medium;
  const currentStep = STATUS_STEPS.find(s => s.id === issue.status)?.stepIndex || 1;
  const isDuplicate = issue.duplicate_status === 'flagged';
  const isResolved = issue.status === 'resolved';

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onUpdateStatus(issue.id, {
        status: newStatus,
        changed_by: isAdmin ? 'Municipal Dispatcher' : 'Authorized Staff',
        notes: statusNotes,
        assigned_department: assignedDept,
        assigned_person: assignedPerson,
        resolution_notes: newStatus === 'resolved' ? resNotes : undefined,
        resolution_image_url: newStatus === 'resolved' ? resImageUrl : undefined
      });
      setStatusNotes('');
    } catch (err) {
      alert(err.message || 'Error updating status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReclassificationSubmit = async (e) => {
    e.preventDefault();
    if (!overrideReason.trim()) {
      alert('Please provide a mandatory staff justification for reclassifying this report.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onUpdateClassification(issue.id, {
        category: reclassCategory,
        severity: reclassSeverity,
        override_reason: overrideReason,
        changed_by: 'City Staff Supervisor'
      });
      setIsEditingClass(false);
      setOverrideReason('');
    } catch (err) {
      alert(err.message || 'Error reclassifying issue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDuplicateAction = async (newStatus) => {
    setIsSubmitting(true);
    try {
      await onUpdateDuplicate(issue.id, {
        duplicate_status: newStatus,
        notes: newStatus === 'dismissed' 
          ? 'Staff reviewed and marked this report as an independent non-duplicate incident.'
          : 'Staff confirmed duplicate and linked supporting photographic evidence.',
        changed_by: 'Triage Specialist'
      });
    } catch (err) {
      alert(err.message || 'Error updating duplicate flag');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      
      <div className="relative bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-sm bg-civic-100 text-civic-800 px-2.5 py-1 rounded-lg border border-civic-200">
              #{issue.id}
            </span>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${cat.badgeClass}`}>
                {cat.label}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${sevCfg.badgeClass}`}>
                {sevCfg.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onUpvote(issue.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
              title="Affirm community witness"
            >
              <ThumbsUp className="w-3.5 h-3.5 text-civic-600" />
              <span>{issue.upvotes || 1} Affirmations</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Duplicate Warning Callout */}
          {isDuplicate && (
            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <CopyCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-indigo-950">
                    Flagged as Potential Duplicate of #{issue.potential_duplicate_of}
                  </h4>
                  <p className="text-xs text-indigo-800 mt-0.5">
                    Spatial and visual correlation engine identified a {Math.round((issue.duplicate_confidence || 0.85) * 100)}% match nearby.
                  </p>
                </div>
              </div>

              {isAdmin && (
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => handleDuplicateAction('dismissed')}
                    disabled={isSubmitting}
                    className="text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-xl shadow-xs"
                  >
                    Dismiss Flag
                  </button>
                  <button
                    onClick={() => handleDuplicateAction('confirmed')}
                    disabled={isSubmitting}
                    className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-xl shadow-xs"
                  >
                    Confirm Duplicate
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Title & Location Header */}
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-2">
              {issue.title}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-500">
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <MapPin className="w-4 h-4 text-civic-600" />
                {issue.address}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                Reported {formatDate(issue.created_at)}
              </span>
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-slate-400" />
                By {issue.reporter_name || 'Community Member'}
              </span>
            </div>
          </div>

          {/* Media Images & Map Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Primary Evidence Photo */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video md:aspect-auto h-56 sm:h-64 shadow-xs">
              <img
                src={issue.image_url}
                alt={issue.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <div className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-white text-[11px] font-bold">
                📸 Initial Evidence Submission
              </div>
            </div>

            {/* Resolved Photo OR Location Map */}
            {isResolved && issue.resolution_image_url ? (
              <div className="relative rounded-2xl overflow-hidden border border-emerald-300 bg-emerald-50 aspect-video md:aspect-auto h-56 sm:h-64 shadow-xs">
                <img
                  src={issue.resolution_image_url}
                  alt="Resolution Proof"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2.5 left-2.5 bg-emerald-800/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-white text-[11px] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                  Official Resolution Proof
                </div>
              </div>
            ) : (
              <div className="h-56 sm:h-64 rounded-2xl overflow-hidden border border-slate-200">
                <MapView
                  issues={[issue]}
                  selectedIssue={issue}
                  center={[issue.latitude, issue.longitude]}
                  zoom={15}
                  height="100%"
                />
              </div>
            )}

          </div>

          {/* Full Issue Description */}
          <div className="bg-slate-50/70 rounded-2xl p-4 sm:p-5 border border-slate-200/80">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Citizen Description & Observations
            </h4>
            <p className="text-sm sm:text-base text-slate-800 leading-relaxed">
              {issue.description}
            </p>
            {issue.landmark && (
              <p className="text-xs text-slate-500 mt-2 font-medium">
                📍 Landmark Reference: {issue.landmark}
              </p>
            )}
          </div>

          {/* Resolution Card if Resolved */}
          {isResolved && (
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
              <div className="flex items-center gap-2 text-emerald-900 font-bold mb-1">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Issue Successfully Resolved</span>
              </div>
              <p className="text-xs text-emerald-700 mb-2">
                Resolved on {formatDate(issue.resolved_at)} by {issue.assigned_person || issue.assigned_department}
              </p>
              {issue.resolution_notes && (
                <p className="text-sm text-emerald-900 bg-white/80 p-3 rounded-xl border border-emerald-200/80">
                  {issue.resolution_notes}
                </p>
              )}
            </div>
          )}

          {/* Detailed Tabs: Evidence Trail vs AI Triage Breakdown vs Staff Actions */}
          <div className="border-t border-slate-200 pt-4">
            
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-4">
              <button
                onClick={() => setActiveTab('trail')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'trail'
                    ? 'bg-civic-700 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <FileCheck className="w-4 h-4" />
                Evidence Trail ({issue.timeline_events?.length || 1} Entries)
              </button>

              <button
                onClick={() => setActiveTab('ai')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'ai'
                    ? 'bg-civic-700 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                AI Triage Analysis
              </button>

              {isAdmin && (
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    activeTab === 'admin'
                      ? 'bg-civic-700 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  Staff Operations
                </button>
              )}
            </div>

            {/* TAB 1: EVIDENCE TRAIL TIMELINE */}
            {activeTab === 'trail' && (
              <div className="space-y-4">
                
                {/* 5-Step Visual Stepper */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 mb-6">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
                    <span>Evidence Lifecycle Progression</span>
                    <span className="text-civic-700">Step {currentStep} of 5</span>
                  </div>
                  <div className="flex items-center justify-between relative">
                    <div className="absolute top-1/2 left-4 right-4 h-1 bg-slate-200 -translate-y-1/2 z-0" />
                    <div 
                      className="absolute top-1/2 left-4 h-1 bg-civic-600 -translate-y-1/2 z-0 transition-all duration-300"
                      style={{ width: `${((currentStep - 1) / 4) * 94}%` }}
                    />
                    {STATUS_STEPS.map((step) => {
                      const isPastOrCurrent = step.stepIndex <= currentStep;
                      const isCurrent = step.stepIndex === currentStep;
                      return (
                        <div key={step.id} className="relative z-10 flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                            isCurrent
                              ? 'bg-civic-600 text-white ring-4 ring-civic-100 shadow-md'
                              : isPastOrCurrent
                                ? 'bg-civic-700 text-white'
                                : 'bg-white border-2 border-slate-300 text-slate-400'
                          }`}>
                            {isPastOrCurrent ? '✓' : step.stepIndex}
                          </div>
                          <span className={`text-[11px] font-semibold mt-1.5 ${
                            isCurrent ? 'text-civic-900 font-bold' : 'text-slate-500'
                          }`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Audit Log Events List */}
                <div className="flow-root">
                  <ul className="-mb-8">
                    {issue.timeline_events && issue.timeline_events.map((event, idx) => {
                      const isLast = idx === issue.timeline_events.length - 1;
                      return (
                        <li key={event.id || idx}>
                          <div className="relative pb-8">
                            {!isLast && (
                              <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true" />
                            )}
                            <div className="relative flex items-start space-x-3">
                              <div className="h-8 w-8 rounded-full bg-civic-50 border-2 border-civic-500 flex items-center justify-center ring-4 ring-white shrink-0">
                                <span className="text-civic-700 font-bold text-xs">{idx + 1}</span>
                              </div>
                              <div className="min-w-0 flex-1 bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs">
                                <div className="flex items-center justify-between text-xs mb-1">
                                  <div className="font-bold text-slate-900 flex items-center gap-2">
                                    <span>{event.changed_by}</span>
                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                                      {event.to_status.replace('_', ' ')}
                                    </span>
                                  </div>
                                  <span className="text-slate-400 font-mono text-[11px]">
                                    {formatDate(event.created_at)}
                                  </span>
                                </div>
                                <p className="text-xs sm:text-sm text-slate-600">
                                  {event.notes}
                                </p>
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>

              </div>
            )}

            {/* TAB 2: AI TRIAGE BREAKDOWN */}
            {activeTab === 'ai' && (
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-civic-50/50 to-blue-50/30 p-5 rounded-2xl border border-civic-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-civic-600" />
                      <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                        AI Multimodal Inference Summary
                      </h4>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-civic-100 text-civic-800 border border-civic-300">
                      Confidence: {Math.round((issue.ai_category_confidence || 0.88) * 100)}%
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm mb-4">
                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <span className="text-slate-500 font-medium block mb-1">Predicted Category</span>
                      <span className="font-bold text-slate-900 capitalize flex items-center gap-1.5">
                        {issue.ai_category.replace('_', ' ')}
                        {issue.category_overridden && (
                          <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.2 rounded">
                            Staff Overridden
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <span className="text-slate-500 font-medium block mb-1">Suggested Severity</span>
                      <span className="font-bold text-slate-900 capitalize">
                        {issue.ai_severity || issue.severity}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 mb-3">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      AI Severity & Risk Justification
                    </span>
                    <p className="text-xs sm:text-sm text-slate-700">
                      {issue.ai_severity_reasoning || 'Diagnostic heuristics evaluated potential pedestrian risk, traffic flow, and hazard duration.'}
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Target Routing Department
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-civic-900">
                      🏛️ {issue.assigned_department || 'Department of Public Works'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: STAFF OPERATIONS (ADMIN ONLY) */}
            {activeTab === 'admin' && isAdmin && (
              <div className="space-y-6">
                
                {/* Form A: Advance Status */}
                <form onSubmit={handleStatusSubmit} className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-civic-700" />
                    Advance Evidence Status & Dispatch Assignment
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Status Transition</label>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-civic-500/20"
                      >
                        <option value="submitted">1. Submitted</option>
                        <option value="under_review">2. Under Review</option>
                        <option value="assigned">3. Assigned to Crew</option>
                        <option value="in_progress">4. In Progress (Active)</option>
                        <option value="resolved">5. Resolved (Closed)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Department</label>
                      <input
                        type="text"
                        value={assignedDept}
                        onChange={(e) => setAssignedDept(e.target.value)}
                        placeholder="e.g. Dept of Public Works"
                        className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-xl p-2.5"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Field Lead / Crew</label>
                      <input
                        type="text"
                        value={assignedPerson}
                        onChange={(e) => setAssignedPerson(e.target.value)}
                        placeholder="e.g. Dave Martinez (Unit 3)"
                        className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-xl p-2.5"
                      />
                    </div>
                  </div>

                  {newStatus === 'resolved' && (
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 mb-3 space-y-3">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Resolution Verification Evidence
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-emerald-900 mb-1">Resolution Summary Note</label>
                        <textarea
                          rows={2}
                          value={resNotes}
                          onChange={(e) => setResNotes(e.target.value)}
                          placeholder="Describe the completed repairs or actions taken..."
                          className="w-full text-xs bg-white border border-emerald-300 rounded-lg p-2"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-emerald-900 mb-1">Resolution Proof Image URL</label>
                        <input
                          type="url"
                          value={resImageUrl}
                          onChange={(e) => setResImageUrl(e.target.value)}
                          placeholder="https://... photo of completed work"
                          className="w-full text-xs bg-white border border-emerald-300 rounded-lg p-2"
                        />
                      </div>
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Audit Trail Note</label>
                    <input
                      type="text"
                      value={statusNotes}
                      onChange={(e) => setStatusNotes(e.target.value)}
                      placeholder="e.g. Dispatched asphalt resurfacing team to site."
                      className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-xl p-2.5"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 bg-civic-700 hover:bg-civic-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors shadow-xs"
                  >
                    {isSubmitting ? 'Updating...' : 'Save Status & Update Evidence Trail'}
                  </button>
                </form>

                {/* Form B: Reclassify Category / Severity */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Edit3 className="w-4 h-4 text-purple-700" />
                      Override AI Classification (Human-in-the-Loop)
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsEditingClass(!isEditingClass)}
                      className="text-xs font-bold text-purple-700 hover:text-purple-900 underline"
                    >
                      {isEditingClass ? 'Cancel' : 'Change Category / Severity'}
                    </button>
                  </div>

                  {isEditingClass ? (
                    <form onSubmit={handleReclassificationSubmit} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                          <select
                            value={reclassCategory}
                            onChange={(e) => setReclassCategory(e.target.value)}
                            className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-xl p-2.5"
                          >
                            <option value="potholes">Potholes & Road Hazard</option>
                            <option value="waste">Illegal Dumping & Waste</option>
                            <option value="broken_streetlights">Broken Streetlights</option>
                            <option value="water_leaks">Water Leaks & Pipe Bursts</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Severity</label>
                          <select
                            value={reclassSeverity}
                            onChange={(e) => setReclassSeverity(e.target.value)}
                            className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-xl p-2.5"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="critical">Critical</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Mandatory Human Justification / Audit Reason *
                        </label>
                        <input
                          type="text"
                          required
                          value={overrideReason}
                          onChange={(e) => setOverrideReason(e.target.value)}
                          placeholder="e.g. Visual inspection reveals underground water main rupture rather than surface pothole."
                          className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-xl p-2.5"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors shadow-xs"
                      >
                        Confirm Staff Reclassification
                      </button>
                    </form>
                  ) : (
                    <p className="text-xs text-slate-500">
                      Currently classified as <strong className="text-slate-800 capitalize">{issue.category.replace('_', ' ')}</strong> ({issue.severity} severity). Click above to alter if AI misclassified the photographic evidence.
                    </p>
                  )}
                </div>

              </div>
            )}

          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>CivicLens Audit ID: <strong className="font-mono">{issue.id}</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-2 font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl shadow-xs transition-colors"
          >
            Close Details
          </button>
        </div>

      </div>

    </div>
  );
}
