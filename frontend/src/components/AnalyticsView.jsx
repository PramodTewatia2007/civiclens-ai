import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Layers, 
  Activity,
  ShieldCheck,
  Building2,
  Trash2,
  Droplets,
  LightbulbOff
} from 'lucide-react';
import { CATEGORIES, SEVERITIES } from '../utils/helpers';

export default function AnalyticsView({ analytics, issues }) {
  if (!analytics) return null;

  const total = analytics.total_reports || 1;
  const categories = analytics.category_breakdown || {};
  const severities = analytics.severity_breakdown || {};
  const statuses = analytics.status_breakdown || {};

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-civic-50 text-civic-700 border border-civic-200 mb-2">
            <BarChart3 className="w-3.5 h-3.5 text-civic-600" />
            Civic Operations Telemetry
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Community Infrastructure & Resolution Analytics
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Real-time tracking of community complaints, triage responsiveness, duplicate clustering, and resolution performance across city departments.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 shrink-0">
          <div className="text-center px-2">
            <span className="block text-2xl font-black text-emerald-600">
              {analytics.resolution_rate}%
            </span>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Resolution Rate
            </span>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div className="text-center px-2">
            <span className="block text-2xl font-black text-slate-900">
              {analytics.avg_resolution_hours}h
            </span>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Avg Turnaround
            </span>
          </div>
        </div>
      </div>

      {/* Grid 1: Category Distribution & Severity Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category Breakdown Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-civic-600" />
              <h3 className="font-extrabold text-slate-900 text-base">
                Complaints by Category
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">4 Core Domains</span>
          </div>

          <div className="space-y-4">
            {Object.keys(CATEGORIES).map((catKey) => {
              const cat = CATEGORIES[catKey];
              const count = categories[catKey] || 0;
              const percentage = Math.round((count / total) * 100);

              return (
                <div key={catKey} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-bold text-slate-800 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }}></span>
                      {cat.label}
                    </span>
                    <span className="font-mono text-slate-500 font-semibold">
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: cat.color 
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Severity Distribution Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="font-extrabold text-slate-900 text-base">
                Risk & Severity Distribution
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">AI & Staff Assessed</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">
            {Object.keys(SEVERITIES).map((sevKey) => {
              const sev = SEVERITIES[sevKey];
              const count = severities[sevKey] || 0;
              const pct = Math.round((count / total) * 100);

              return (
                <div key={sevKey} className={`p-4 rounded-2xl border ${sev.badgeClass} flex flex-col justify-between`}>
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className="capitalize">{sev.label} Priority</span>
                    <span className={`w-2.5 h-2.5 rounded-full ${sev.dotClass}`}></span>
                  </div>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-2xl font-black">{count}</span>
                    <span className="text-xs font-semibold opacity-80">{pct}% of reports</span>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/70">
            💡 Critical & High severity reports automatically trigger prioritized staff triage routing with an expedited 12-hour resolution SLA target.
          </p>
        </div>

      </div>

      {/* Grid 2: Evidence Lifecycle Funnel & Average Resolution Times */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Evidence Status Progression Funnel */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-civic-700" />
              <h3 className="font-extrabold text-slate-900 text-base">
                Evidence Lifecycle Funnel
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">5-Stage Workflow</span>
          </div>

          <div className="space-y-3">
            {[
              { id: 'submitted', label: '1. Submitted', color: 'bg-slate-200 text-slate-800' },
              { id: 'under_review', label: '2. Under Review', color: 'bg-purple-100 text-purple-800' },
              { id: 'assigned', label: '3. Assigned to Crew', color: 'bg-blue-100 text-blue-800' },
              { id: 'in_progress', label: '4. In Progress (Field Action)', color: 'bg-amber-100 text-amber-800' },
              { id: 'resolved', label: '5. Resolved & Verified', color: 'bg-emerald-100 text-emerald-800' }
            ].map(stage => {
              const count = statuses[stage.id] || 0;
              const pct = Math.round((count / total) * 100);

              return (
                <div key={stage.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${stage.color}`}>
                      {stage.label}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-800">
                    {count} reports ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Resolution SLAs */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-600" />
              <h3 className="font-extrabold text-slate-900 text-base">
                Resolution Velocity by Department
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">Hours to Close</span>
          </div>

          <div className="space-y-4">
            {[
              { cat: 'water_leaks', label: 'Water Leaks & Ruptures', hours: 8.5, target: 12, dept: 'City Water & Sewage' },
              { cat: 'waste', label: 'Sanitation & Illegal Dumping', hours: 18.4, target: 24, dept: 'Sanitation Bureau' },
              { cat: 'broken_streetlights', label: 'Streetlights & Electrical', hours: 24.0, target: 36, dept: 'Municipal Power' },
              { cat: 'potholes', label: 'Potholes & Road Resurfacing', hours: 48.2, target: 48, dept: 'Public Works & Roads' }
            ].map((item) => (
              <div key={item.cat} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="flex items-center justify-between text-xs sm:text-sm font-bold mb-1">
                  <span className="text-slate-900">{item.label}</span>
                  <span className="font-mono text-purple-700">{item.hours} hrs avg</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>🏛️ {item.dept}</span>
                  <span className="text-emerald-700 font-semibold">Target SLA: &lt;{item.target}h (Met)</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-950 text-xs font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
            <span>AI Automated Triage reduced average dispatcher queue time by 82%.</span>
          </div>
        </div>

      </div>

    </div>
  );
}
