import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DisclaimerBanner from './components/DisclaimerBanner';
import StatsOverview from './components/StatsOverview';
import FilterBar from './components/FilterBar';
import IssueCard from './components/IssueCard';
import MapView from './components/MapView';
import IssueDetailModal from './components/IssueDetailModal';
import ReportIssueModal from './components/ReportIssueModal';
import AdminPanel from './components/AdminPanel';
import AnalyticsView from './components/AnalyticsView';

import { 
  fetchIssues, 
  fetchIssueById, 
  createIssue, 
  updateIssueStatus, 
  updateIssueClassification, 
  updateDuplicateFlag, 
  upvoteIssue, 
  fetchAnalytics, 
  resetDemoData 
} from './api';

import { 
  Building2, 
  PlusCircle, 
  RotateCcw, 
  ShieldAlert, 
  CheckCircle2, 
  Layers, 
  Sparkles,
  SearchX,
  ExternalLink
} from 'lucide-react';

export default function App() {
  const [issues, setIssues] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [currentTab, setCurrentTab] = useState('dashboard'); // 'dashboard', 'admin', 'analytics'
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('split'); // 'split', 'cards', 'map'
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
    severity: 'all',
    search: '',
    duplicatesOnly: false
  });

  // Load Data
  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [issuesData, analyticsData] = await Promise.all([
        fetchIssues(filters),
        fetchAnalytics()
      ]);
      setIssues(issuesData);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Error loading civic data:', err);
      setError('Unable to connect to CivicLens API. Ensure backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters.category, filters.status, filters.severity, filters.search, filters.duplicatesOnly]);

  // Create Issue
  const handleCreateIssue = async (payload) => {
    const newIssue = await createIssue(payload);
    await loadData();
    setSelectedIssue(newIssue);
  };

  // Update Status
  const handleUpdateStatus = async (id, payload) => {
    const updated = await updateIssueStatus(id, payload);
    await loadData();
    setSelectedIssue(updated);
  };

  // Override AI Classification
  const handleUpdateClassification = async (id, payload) => {
    const updated = await updateIssueClassification(id, payload);
    await loadData();
    setSelectedIssue(updated);
  };

  // Update Duplicate Flag
  const handleUpdateDuplicate = async (id, payload) => {
    const updated = await updateDuplicateFlag(id, payload);
    await loadData();
    setSelectedIssue(updated);
  };

  // Upvote
  const handleUpvote = async (id) => {
    try {
      const updated = await upvoteIssue(id);
      setIssues(prev => prev.map(item => item.id === id ? { ...item, upvotes: updated.upvotes } : item));
      if (selectedIssue && selectedIssue.id === id) {
        setSelectedIssue(prev => ({ ...prev, upvotes: updated.upvotes }));
      }
    } catch (err) {
      console.error('Upvote failed:', err);
    }
  };

  // Reset Demo
  const handleResetData = async () => {
    if (window.confirm('Reset demo database to fresh fictional civic reports?')) {
      await resetDemoData();
      await loadData();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-civic-100 selection:text-civic-900">
      
      {/* 1. Global Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onResetData={handleResetData}
        totalIssues={issues.length}
      />

      {/* 2. AI Governance & Human Decision Disclaimer Banner */}
      <DisclaimerBanner />

      {/* 3. Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* KPI Operational Metrics Cards */}
        <StatsOverview
          analytics={analytics}
          onFilterDuplicates={() => setFilters(prev => ({ ...prev, duplicatesOnly: true }))}
          onFilterStatus={(st) => setFilters(prev => ({ ...prev, status: st }))}
        />

        {/* TAB 1: DASHBOARD & MAP */}
        {currentTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Filter Bar */}
            <FilterBar
              filters={filters}
              setFilters={setFilters}
              categoryCounts={analytics?.category_breakdown}
              viewMode={viewMode}
              setViewMode={setViewMode}
              totalFiltered={issues.length}
            />

            {/* Error Banner if API unreachable */}
            {error && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between">
                <span>{error}</span>
                <button 
                  onClick={loadData}
                  className="px-3 py-1 bg-white border border-rose-300 font-bold rounded-lg text-xs"
                >
                  Retry Connection
                </button>
              </div>
            )}

            {/* VIEW MODE: SPLIT VIEW (MAP + CARDS) */}
            {viewMode === 'split' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left: Issues Cards List */}
                <div className="lg:col-span-7 space-y-4">
                  {isLoading ? (
                    <div className="p-12 text-center text-slate-400">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-civic-600 border-t-transparent mb-3" />
                      <p className="text-sm font-semibold">Loading civic reports...</p>
                    </div>
                  ) : issues.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                      <SearchX className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <h4 className="text-base font-bold text-slate-800 mb-1">No matching civic reports</h4>
                      <p className="text-xs text-slate-500 mb-4">Try clearing filters or search query.</p>
                      <button
                        onClick={() => setFilters({ category: 'all', status: 'all', severity: 'all', search: '', duplicatesOnly: false })}
                        className="px-4 py-2 bg-civic-600 text-white font-bold text-xs rounded-xl"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {issues.map(issue => (
                        <IssueCard
                          key={issue.id}
                          issue={issue}
                          onSelect={setSelectedIssue}
                          onUpvote={handleUpvote}
                          isAdmin={isAdmin}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: Sticky Interactive Map */}
                <div className="lg:col-span-5 sticky top-24">
                  <div className="bg-white p-3 rounded-3xl border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between px-2 py-1.5 mb-2 text-xs font-bold text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-civic-600" />
                        Live Geospatial Map ({issues.length} active markers)
                      </span>
                      <span className="text-slate-400 text-[11px]">Click pin to inspect</span>
                    </div>
                    <MapView
                      issues={issues}
                      selectedIssue={selectedIssue}
                      onSelectIssue={setSelectedIssue}
                      center={[37.7750, -122.4180]}
                      zoom={14}
                      height="580px"
                    />
                  </div>
                </div>

              </div>
            )}

            {/* VIEW MODE: CARDS GRID ONLY */}
            {viewMode === 'cards' && (
              <div>
                {issues.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                    <SearchX className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h4 className="text-base font-bold text-slate-800 mb-1">No matching civic reports</h4>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {issues.map(issue => (
                      <IssueCard
                        key={issue.id}
                        issue={issue}
                        onSelect={setSelectedIssue}
                        onUpvote={handleUpvote}
                        isAdmin={isAdmin}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* VIEW MODE: FULL MAP ONLY */}
            {viewMode === 'map' && (
              <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
                <MapView
                  issues={issues}
                  selectedIssue={selectedIssue}
                  onSelectIssue={setSelectedIssue}
                  center={[37.7750, -122.4180]}
                  zoom={14}
                  height="700px"
                />
              </div>
            )}

          </div>
        )}

        {/* TAB 2: STAFF OPERATIONS & DISPATCH */}
        {currentTab === 'admin' && (
          <AdminPanel
            issues={issues}
            onSelectIssue={setSelectedIssue}
            onQuickUpdateStatus={async (id, st, notes) => {
              await handleUpdateStatus(id, {
                status: st,
                changed_by: 'Staff Dispatcher',
                notes: notes
              });
            }}
          />
        )}

        {/* TAB 3: CIVIC ANALYTICS */}
        {currentTab === 'analytics' && (
          <AnalyticsView
            analytics={analytics}
            issues={issues}
          />
        )}

      </main>

      {/* Issue Detail / Evidence Trail Modal */}
      {selectedIssue && (
        <IssueDetailModal
          key={selectedIssue.id}
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
          onUpdateStatus={handleUpdateStatus}
          onUpdateClassification={handleUpdateClassification}
          onUpdateDuplicate={handleUpdateDuplicate}
          onUpvote={handleUpvote}
          isAdmin={isAdmin}
        />
      )}

      {/* Report Issue Modal */}
      {isReportModalOpen && (
        <ReportIssueModal
          onClose={() => setIsReportModalOpen(false)}
          onSubmitIssue={handleCreateIssue}
          onSelectExistingIssue={(id) => {
            const found = issues.find(i => i.id === id);
            if (found) setSelectedIssue(found);
          }}
        />
      )}

      {/* Global Civic Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-civic-600" />
            <span className="font-bold text-slate-800">CivicLens AI</span>
            <span>—</span>
            <span>Turn community complaints into organized, actionable evidence.</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Leaflet + OpenStreetMap</span>
            <span>•</span>
            <span>FastAPI + SQLite/Supabase</span>
            <span>•</span>
            <span>Gemini Vision Multimodal & NLP</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
