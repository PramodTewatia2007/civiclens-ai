import React from 'react';
import { 
  Building2, 
  MapPin, 
  ShieldCheck, 
  BarChart3, 
  PlusCircle, 
  UserCheck, 
  Users, 
  RotateCcw,
  Sparkles,
  Layers
} from 'lucide-react';

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  isAdmin, 
  setIsAdmin, 
  onOpenReportModal, 
  onResetData, 
  totalIssues 
}) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-civic-700 to-civic-500 flex items-center justify-center text-white shadow-md shadow-civic-500/20">
              <Building2 className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                  CivicLens <span className="text-civic-600 font-black">AI</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-civic-50 text-civic-700 border border-civic-200">
                  <Sparkles className="w-3 h-3 mr-1 text-civic-500" />
                  Civic-Tech Engine
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 hidden md:block font-medium">
                Turn community complaints into organized, actionable evidence.
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                currentTab === 'dashboard'
                  ? 'bg-white text-civic-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Layers className="w-4 h-4" />
              Dashboard & Map
            </button>

            <button
              onClick={() => setCurrentTab('admin')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                currentTab === 'admin'
                  ? 'bg-white text-civic-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Staff Triage Portal
              {isAdmin && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              )}
            </button>

            <button
              onClick={() => setCurrentTab('analytics')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                currentTab === 'analytics'
                  ? 'bg-white text-civic-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Analytics & Insights
            </button>
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Role Switcher Pill */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-medium">
              <button
                onClick={() => setIsAdmin(false)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
                  !isAdmin 
                    ? 'bg-white text-slate-900 shadow-sm font-semibold' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="View as Resident / Community member"
              >
                <Users className="w-3.5 h-3.5 text-civic-600" />
                <span className="hidden sm:inline">Resident</span>
              </button>
              <button
                onClick={() => {
                  setIsAdmin(true);
                  if (currentTab !== 'admin' && currentTab !== 'analytics') {
                    // keep current tab or stay
                  }
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
                  isAdmin 
                    ? 'bg-civic-700 text-white shadow-sm font-semibold' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Switch to Municipal Staff / Admin View"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">City Staff</span>
              </button>
            </div>

            {/* Reset Seed Demo Data Button */}
            <button
              onClick={onResetData}
              title="Reset Demo Dataset"
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200 hidden md:flex items-center"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Primary Report Button */}
            <button
              onClick={onOpenReportModal}
              className="flex items-center gap-2 bg-civic-600 hover:bg-civic-700 text-white px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm shadow-md shadow-civic-600/25 hover:shadow-lg transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              <span>Report Issue</span>
            </button>
          </div>
        </div>

        {/* Mobile Subnavigation */}
        <div className="flex lg:hidden items-center justify-around py-2 border-t border-slate-100 text-xs font-semibold text-slate-600">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`flex items-center gap-1 py-1 px-2.5 rounded-lg ${
              currentTab === 'dashboard' ? 'text-civic-700 bg-civic-50 font-bold' : ''
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Dashboard
          </button>
          <button
            onClick={() => setCurrentTab('admin')}
            className={`flex items-center gap-1 py-1 px-2.5 rounded-lg ${
              currentTab === 'admin' ? 'text-civic-700 bg-civic-50 font-bold' : ''
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Staff Triage
          </button>
          <button
            onClick={() => setCurrentTab('analytics')}
            className={`flex items-center gap-1 py-1 px-2.5 rounded-lg ${
              currentTab === 'analytics' ? 'text-civic-700 bg-civic-50 font-bold' : ''
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Analytics
          </button>
        </div>

      </div>
    </header>
  );
}
