import React from 'react';
import { 
  Search, 
  Filter, 
  Map as MapIcon, 
  LayoutGrid, 
  Split, 
  CopyCheck, 
  AlertTriangle, 
  Trash2, 
  LightbulbOff, 
  Droplets,
  Layers,
  X
} from 'lucide-react';
import { CATEGORIES, SEVERITIES } from '../utils/helpers';

export default function FilterBar({ 
  filters, 
  setFilters, 
  categoryCounts, 
  viewMode, 
  setViewMode, 
  totalFiltered 
}) {

  const handleCategoryChange = (catId) => {
    setFilters(prev => ({
      ...prev,
      category: prev.category === catId ? 'all' : catId
    }));
  };

  const handleStatusChange = (statusId) => {
    setFilters(prev => ({
      ...prev,
      status: statusId
    }));
  };

  const handleSeverityChange = (sev) => {
    setFilters(prev => ({
      ...prev,
      severity: sev
    }));
  };

  const toggleDuplicates = () => {
    setFilters(prev => ({
      ...prev,
      duplicatesOnly: !prev.duplicatesOnly
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      category: 'all',
      status: 'all',
      severity: 'all',
      search: '',
      duplicatesOnly: false
    });
  };

  const hasActiveFilters = 
    filters.category !== 'all' || 
    filters.status !== 'all' || 
    filters.severity !== 'all' || 
    filters.search !== '' || 
    filters.duplicatesOnly;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5 mb-6 space-y-4">
      
      {/* Top Row: Search + Status + View Toggle */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            placeholder="Search by issue title, description, address, or ID (e.g. CV-101)..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-civic-500/20 focus:border-civic-500 transition-all placeholder:text-slate-400"
          />
          {filters.search && (
            <button 
              onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right side controls: Status, Severity, Duplicates, View */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Status Dropdown */}
          <select
            value={filters.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="text-xs sm:text-sm font-medium bg-slate-50 border border-slate-200 text-slate-700 py-2 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-civic-500/20"
          >
            <option value="all">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>

          {/* Severity Dropdown */}
          <select
            value={filters.severity}
            onChange={(e) => handleSeverityChange(e.target.value)}
            className="text-xs sm:text-sm font-medium bg-slate-50 border border-slate-200 text-slate-700 py-2 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-civic-500/20"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Duplicates Toggle Button */}
          <button
            onClick={toggleDuplicates}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
              filters.duplicatesOnly
                ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CopyCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Flagged Duplicates</span>
          </button>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 ml-auto md:ml-0">
            <button
              onClick={() => setViewMode('split')}
              title="Split View (Map + Cards)"
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'split' ? 'bg-white text-civic-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Split className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              title="Cards Grid View"
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'cards' ? 'bg-white text-civic-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('map')}
              title="Full Map View"
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'map' ? 'bg-white text-civic-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <MapIcon className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* Category Pills Row */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
        <div className="flex flex-wrap items-center gap-2">
          
          <button
            onClick={() => handleCategoryChange('all')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              filters.category === 'all'
                ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Categories</span>
          </button>

          {/* Potholes */}
          <button
            onClick={() => handleCategoryChange('potholes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              filters.category === 'potholes'
                ? 'bg-orange-600 border-orange-600 text-white shadow-xs'
                : 'bg-orange-50/60 border-orange-200/80 text-orange-900 hover:bg-orange-100/60'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Potholes & Road</span>
            {categoryCounts?.potholes !== undefined && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                filters.category === 'potholes' ? 'bg-white/25 text-white' : 'bg-orange-200/80 text-orange-800'
              }`}>
                {categoryCounts.potholes}
              </span>
            )}
          </button>

          {/* Waste */}
          <button
            onClick={() => handleCategoryChange('waste')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              filters.category === 'waste'
                ? 'bg-green-600 border-green-600 text-white shadow-xs'
                : 'bg-green-50/60 border-green-200/80 text-green-900 hover:bg-green-100/60'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Waste & Dumping</span>
            {categoryCounts?.waste !== undefined && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                filters.category === 'waste' ? 'bg-white/25 text-white' : 'bg-green-200/80 text-green-800'
              }`}>
                {categoryCounts.waste}
              </span>
            )}
          </button>

          {/* Streetlights */}
          <button
            onClick={() => handleCategoryChange('broken_streetlights')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              filters.category === 'broken_streetlights'
                ? 'bg-amber-600 border-amber-600 text-white shadow-xs'
                : 'bg-amber-50/60 border-amber-200/80 text-amber-900 hover:bg-amber-100/60'
            }`}
          >
            <LightbulbOff className="w-3.5 h-3.5" />
            <span>Streetlights</span>
            {categoryCounts?.broken_streetlights !== undefined && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                filters.category === 'broken_streetlights' ? 'bg-white/25 text-white' : 'bg-amber-200/80 text-amber-800'
              }`}>
                {categoryCounts.broken_streetlights}
              </span>
            )}
          </button>

          {/* Water Leaks */}
          <button
            onClick={() => handleCategoryChange('water_leaks')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              filters.category === 'water_leaks'
                ? 'bg-sky-600 border-sky-600 text-white shadow-xs'
                : 'bg-sky-50/60 border-sky-200/80 text-sky-900 hover:bg-sky-100/60'
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>Water Leaks</span>
            {categoryCounts?.water_leaks !== undefined && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                filters.category === 'water_leaks' ? 'bg-white/25 text-white' : 'bg-sky-200/80 text-sky-800'
              }`}>
                {categoryCounts.water_leaks}
              </span>
            )}
          </button>

        </div>

        {/* Results Counter & Reset */}
        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
          <span>
            Showing <strong className="text-slate-800">{totalFiltered}</strong> reports
          </span>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-civic-600 hover:text-civic-800 font-semibold underline underline-offset-2"
            >
              Reset Filters
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
