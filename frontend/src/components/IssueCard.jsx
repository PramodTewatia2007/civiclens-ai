import React from 'react';
import { 
  MapPin, 
  Clock, 
  Sparkles, 
  ThumbsUp, 
  CopyCheck, 
  ArrowRight, 
  CheckCircle2, 
  ShieldAlert, 
  Building2,
  AlertTriangle,
  Trash2,
  LightbulbOff,
  Droplets
} from 'lucide-react';
import { CATEGORIES, SEVERITIES, STATUS_CONFIG, STATUS_STEPS, formatRelativeTime } from '../utils/helpers';

export default function IssueCard({ issue, onSelect, onUpvote, isAdmin }) {
  const cat = CATEGORIES[issue.category] || CATEGORIES.potholes;
  const statusCfg = STATUS_CONFIG[issue.status] || STATUS_CONFIG.submitted;
  const sevCfg = SEVERITIES[issue.severity] || SEVERITIES.medium;
  const isDuplicate = issue.duplicate_status === 'flagged';
  const isResolved = issue.status === 'resolved';

  const currentStep = STATUS_STEPS.find(s => s.id === issue.status)?.stepIndex || 1;

  const renderCategoryIcon = () => {
    switch (issue.category) {
      case 'potholes': return <AlertTriangle className="w-3.5 h-3.5 mr-1" />;
      case 'waste': return <Trash2 className="w-3.5 h-3.5 mr-1" />;
      case 'broken_streetlights': return <LightbulbOff className="w-3.5 h-3.5 mr-1" />;
      case 'water_leaks': return <Droplets className="w-3.5 h-3.5 mr-1" />;
      default: return null;
    }
  };

  return (
    <div className={`bg-white rounded-2xl border transition-all duration-200 shadow-xs hover:shadow-md flex flex-col overflow-hidden ${
      isDuplicate ? 'border-indigo-300 ring-1 ring-indigo-200' : 'border-slate-200/90 hover:border-slate-300'
    }`}>
      
      {/* Card Image Header */}
      <div className="relative h-44 w-full bg-slate-100 overflow-hidden cursor-pointer" onClick={() => onSelect(issue)}>
        <img
          src={issue.image_url}
          alt={issue.title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-black/20 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold shadow-xs backdrop-blur-md ${cat.badgeClass}`}>
            {renderCategoryIcon()}
            {cat.shortLabel}
          </span>
          {issue.category_overridden && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
              Staff Adjusted
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3 z-10">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold shadow-xs ${sevCfg.badgeClass}`}>
            <span className={`w-2 h-2 rounded-full ${sevCfg.dotClass}`}></span>
            {sevCfg.label}
          </span>
        </div>

        {/* Bottom overlay in image: ID & Time */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs font-medium z-10">
          <span className="font-mono bg-black/40 px-2 py-0.5 rounded backdrop-blur-xs font-bold">
            #{issue.id}
          </span>
          <span className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded backdrop-blur-xs text-[11px]">
            <Clock className="w-3 h-3" />
            {formatRelativeTime(issue.created_at)}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        
        <div>
          {/* Duplicate Flag Banner */}
          {isDuplicate && (
            <div className="mb-3 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-semibold flex items-center gap-2">
              <CopyCheck className="w-4 h-4 text-indigo-600 shrink-0" />
              <span className="line-clamp-1">
                Potential duplicate of <strong>#{issue.potential_duplicate_of}</strong> ({Math.round((issue.duplicate_confidence || 0.85) * 100)}% match)
              </span>
            </div>
          )}

          {/* Title */}
          <h3 
            onClick={() => onSelect(issue)}
            className="text-base font-bold text-slate-900 hover:text-civic-700 transition-colors line-clamp-2 cursor-pointer mb-2 leading-snug"
          >
            {issue.title}
          </h3>

          {/* Description snippet */}
          <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 mb-3 leading-relaxed">
            {issue.description}
          </p>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{issue.address}</span>
          </div>

          {/* AI Evidence Suggestion Tag */}
          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 mb-4 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-600">
              <Sparkles className="w-3.5 h-3.5 text-civic-600 shrink-0" />
              <span className="font-semibold text-slate-700">AI Triage:</span>
              <span className="text-slate-500 truncate">{issue.ai_category_confidence ? `${Math.round(issue.ai_category_confidence * 100)}% conf` : 'Analyzed'}</span>
            </div>
            <span className="font-mono text-[11px] text-civic-700 font-bold">
              {issue.assigned_department ? issue.assigned_department.split('&')[0].trim() : 'Routing...'}
            </span>
          </div>
        </div>

        {/* Evidence Trail Progress Bar */}
        <div className="border-t border-slate-100 pt-3 mt-auto">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-bold text-slate-700 flex items-center gap-1">
              Evidence Status:
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusCfg.badgeClass}`}>
                {statusCfg.label}
              </span>
            </span>
            <span className="text-[11px] font-bold text-slate-400">
              Step {currentStep} of 5
            </span>
          </div>

          {/* 5-Step Segmented Bar */}
          <div className="grid grid-cols-5 gap-1 h-1.5 mb-3.5">
            {STATUS_STEPS.map((step) => {
              const isFilled = step.stepIndex <= currentStep;
              return (
                <div
                  key={step.id}
                  className={`rounded-full transition-all ${
                    isFilled 
                      ? isResolved 
                        ? 'bg-emerald-500' 
                        : 'bg-civic-600'
                      : 'bg-slate-200'
                  }`}
                  title={step.label}
                />
              );
            })}
          </div>

          {/* Card Footer Actions */}
          <div className="flex items-center justify-between gap-2">
            
            {/* Upvote / Affirm Button */}
            <button
              onClick={() => onUpvote(issue.id)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-civic-700 transition-colors"
              title="Confirm you have seen this civic issue"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>{issue.upvotes || 1}</span>
            </button>

            {/* View Details Button */}
            <button
              onClick={() => onSelect(issue)}
              className="flex items-center gap-1 text-xs font-bold text-civic-700 hover:text-civic-800 bg-civic-50 hover:bg-civic-100 px-3 py-1.5 rounded-lg transition-colors ml-auto"
            >
              <span>{isAdmin ? 'Triage Evidence' : 'Inspect Trail'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}
