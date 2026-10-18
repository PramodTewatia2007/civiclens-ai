import React, { useState, useEffect } from 'react';
import { 
  X, 
  Upload, 
  MapPin, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  CopyCheck, 
  ArrowRight,
  HelpCircle,
  Camera,
  Image as ImageIcon
} from 'lucide-react';
import { 
  CATEGORIES, 
  SEVERITIES, 
  CIVIC_HOTSPOTS, 
  SAMPLE_PHOTOS 
} from '../utils/helpers';
import { classifyAI, checkDuplicatesAI, uploadImage } from '../api';
import MapView from './MapView';

export default function ReportIssueModal({ onClose, onSubmitIssue, onSelectExistingIssue }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Location
  const [latitude, setLatitude] = useState(37.7750);
  const [longitude, setLongitude] = useState(-122.4193);
  const [address, setAddress] = useState('450 Oak Street, Civic Center');
  const [landmark, setLandmark] = useState('');

  // AI Classification state
  const [aiResult, setAiResult] = useState(null);
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const [manualCategory, setManualCategory] = useState('');
  const [manualSeverity, setManualSeverity] = useState('');

  // Duplicate Check state
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);

  // Reporter
  const [reporterName, setReporterName] = useState('');
  const [reporterContact, setReporterContact] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Select a preset sample photo for quick demo testing
  const handleSelectSample = (sample) => {
    setImageUrl(sample.url);
    setImagePreview(sample.url);
    if (!title) setTitle(sample.title);
    if (!description) setDescription(sample.description);
    triggerAIAnalysis(sample.title, sample.description, sample.label);
  };

  // Run AI analysis
  const triggerAIAnalysis = async (t, d, imgName) => {
    if (!d && !t && !imgName) return;
    setIsAnalyzingAI(true);
    try {
      const res = await classifyAI({
        title: t || '',
        description: d || '',
        image_name: imgName || imageUrl || 'uploaded_photo.jpg'
      });
      setAiResult(res);
      if (!manualCategory) setManualCategory(res.category);
      if (!manualSeverity) setManualSeverity(res.severity);
    } catch (err) {
      console.error('AI classification error:', err);
    } finally {
      setIsAnalyzingAI(false);
    }
  };

  // Debounced auto-classification when user types
  useEffect(() => {
    const timer = setTimeout(() => {
      if (description.length > 10 || title.length > 5) {
        triggerAIAnalysis(title, description, imageUrl);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [title, description, imageUrl]);

  // Run duplicate check when coordinates or category change
  useEffect(() => {
    const checkDupes = async () => {
      const catToCheck = manualCategory || (aiResult?.category) || 'potholes';
      if (!title && !description) return;

      setIsCheckingDuplicates(true);
      try {
        const res = await checkDuplicatesAI({
          latitude,
          longitude,
          category: catToCheck,
          title: title || 'Civic Complaint',
          description: description || ''
        });
        if (res.has_duplicates && res.potential_matches.length > 0) {
          setDuplicateWarning(res);
        } else {
          setDuplicateWarning(null);
        }
      } catch (err) {
        console.error('Duplicate check error:', err);
      } finally {
        setIsCheckingDuplicates(false);
      }
    };

    const timer = setTimeout(checkDupes, 700);
    return () => clearTimeout(timer);
  }, [latitude, longitude, manualCategory, aiResult?.category, title, description]);

  // Handle file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    const localUrl = URL.createObjectURL(file);
    setImagePreview(localUrl);

    try {
      const uploadRes = await uploadImage(file);
      setImageUrl(uploadRes.url);
      triggerAIAnalysis(title, description, file.name);
    } catch (err) {
      // Fallback to local data URL for demo
      setImageUrl(localUrl);
    }
  };

  // Map pin click handler
  const handleMapPin = (lat, lng) => {
    setLatitude(parseFloat(lat.toFixed(6)));
    setLongitude(parseFloat(lng.toFixed(6)));
    setAddress(`Near ${lat.toFixed(4)}, ${lng.toFixed(4)} (Selected on Map)`);
  };

  // Hotspot selector
  const handleSelectHotspot = (spot) => {
    setLatitude(spot.lat);
    setLongitude(spot.lng);
    setAddress(spot.address);
    setLandmark(spot.name);
  };

  // Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert('Please provide an issue title and description.');
      return;
    }

    const finalImage = imageUrl || imagePreview || SAMPLE_PHOTOS[0].url;
    const finalCategory = manualCategory || aiResult?.category || 'potholes';
    const finalSeverity = manualSeverity || aiResult?.severity || 'medium';

    setIsSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category: finalCategory,
        severity: finalSeverity,
        ai_category: aiResult?.category || finalCategory,
        ai_category_confidence: aiResult?.category_confidence || 0.88,
        ai_severity: aiResult?.severity || finalSeverity,
        ai_severity_reasoning: aiResult?.severity_reasoning || 'Automated classification review',
        latitude,
        longitude,
        address,
        landmark: landmark || undefined,
        image_url: finalImage,
        reporter_name: reporterName.trim() || 'Community Resident',
        reporter_contact: reporterContact.trim() || undefined,
        potential_duplicate_of: duplicateWarning?.top_match_id || undefined,
        duplicate_confidence: duplicateWarning ? (duplicateWarning.potential_matches[0]?.similarity_score / 100) : undefined,
        duplicate_status: duplicateWarning ? 'flagged' : 'none'
      };

      await onSubmitIssue(payload);
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to submit issue report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      
      <div className="relative bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-civic-600 text-white shadow-xs">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Report a Community Issue
              </h2>
              <p className="text-xs text-slate-500">
                CivicLens AI will categorize evidence and route to municipal teams.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* STEP 1: PHOTO EVIDENCE UPLOAD */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              1. Photographic Evidence *
            </label>

            {/* Quick Demo Sample Photos */}
            <div className="mb-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-civic-600" />
                  Quick Demo Testing (Click any sample to auto-fill):
                </span>
                <span className="text-[11px] text-slate-400">One-click testing</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SAMPLE_PHOTOS.map((sample) => (
                  <button
                    key={sample.label}
                    type="button"
                    onClick={() => handleSelectSample(sample)}
                    className="p-2 text-left rounded-xl bg-white border border-slate-200 hover:border-civic-500 hover:bg-civic-50/50 transition-all text-xs font-medium group flex items-center gap-2"
                  >
                    <img 
                      src={sample.url} 
                      alt={sample.label}
                      className="w-8 h-8 rounded-lg object-cover" 
                    />
                    <span className="truncate group-hover:text-civic-700 font-semibold text-[11px]">
                      {sample.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* File Upload / Image Preview Area */}
            <div className="relative border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center hover:border-civic-400 transition-colors bg-white">
              {imagePreview ? (
                <div className="relative h-44 w-full rounded-xl overflow-hidden bg-slate-100 group">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <label className="cursor-pointer bg-white text-slate-800 text-xs font-bold py-1.5 px-3 rounded-lg shadow-sm hover:bg-slate-50">
                      Change Photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <div className="py-4">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                    Upload photo or drag and drop
                  </p>
                  <p className="text-xs text-slate-400 mb-3">
                    PNG, JPG, WEBP up to 10MB
                  </p>
                  <label className="cursor-pointer inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2 px-4 rounded-xl transition-colors">
                    <ImageIcon className="w-3.5 h-3.5" />
                    Browse Local File
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>

          </div>

          {/* STEP 2: ISSUE DESCRIPTION */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              2. Complaint Details *
            </label>
            
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Hazardous Pothole breaking car rims on Oak St"
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-civic-500/20 focus:border-civic-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Detailed Description & Environmental Context
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe size, immediate danger, proximity to school/transit, leak pressure, or street obstruction..."
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-civic-500/20 focus:border-civic-500"
              />
            </div>
          </div>

          {/* STEP 3: LIVE AI CLASSIFICATION & SEVERITY PREVIEW */}
          <div className="bg-gradient-to-br from-civic-50/70 to-blue-50/40 rounded-2xl p-4 sm:p-5 border border-civic-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-civic-600 animate-spin" style={{ animationDuration: '4s' }} />
                <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
                  AI Real-Time Classification Preview
                </h4>
              </div>
              {isAnalyzingAI ? (
                <span className="text-[11px] font-bold text-civic-700 animate-pulse">
                  Analyzing evidence...
                </span>
              ) : aiResult ? (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  {Math.round((aiResult.category_confidence || 0.88) * 100)}% Match Confidence
                </span>
              ) : (
                <span className="text-[11px] text-slate-400">
                  Type above to analyze
                </span>
              )}
            </div>

            {aiResult && (
              <div className="space-y-3 animate-in fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-[11px] font-medium text-slate-500 block mb-0.5">
                      Suggested Category
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-900 capitalize">
                      {aiResult.category_name}
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-[11px] font-medium text-slate-500 block mb-0.5">
                      Suggested Severity
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-900 capitalize flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${SEVERITIES[aiResult.severity]?.dotClass || 'bg-slate-400'}`}></span>
                      {aiResult.severity}
                    </span>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs">
                  <span className="font-bold text-slate-600 block mb-1">
                    AI Diagnostic Reasoning:
                  </span>
                  <p className="text-slate-700 leading-relaxed text-[11px] sm:text-xs">
                    {aiResult.severity_reasoning}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500">
                    <span className="font-semibold text-slate-700">Target SLA:</span> {aiResult.estimated_sla}
                    <span className="mx-1">•</span>
                    <span className="font-semibold text-slate-700">Target Bureau:</span> {aiResult.recommended_department}
                  </div>
                </div>

                {/* Option to Override Category if User disagrees */}
                <div className="pt-2 border-t border-civic-100 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
                  <span>Want to choose manually?</span>
                  <select
                    value={manualCategory || aiResult.category}
                    onChange={(e) => setManualCategory(e.target.value)}
                    className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2.5 py-1"
                  >
                    <option value="potholes">Potholes & Road Hazard</option>
                    <option value="waste">Illegal Dumping & Waste</option>
                    <option value="broken_streetlights">Broken Streetlights</option>
                    <option value="water_leaks">Water Leaks & Pipe Bursts</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* STEP 4: LOCATION PICKER */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              3. Issue Geolocation & Address *
            </label>

            {/* Quick Hotspot Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              <span className="text-xs font-bold text-slate-500 mr-1">Hotspots:</span>
              {CIVIC_HOTSPOTS.map((spot) => (
                <button
                  key={spot.name}
                  type="button"
                  onClick={() => handleSelectHotspot(spot)}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-civic-50 hover:text-civic-700 rounded-lg transition-colors border border-slate-200"
                >
                  📍 {spot.name.split('&')[0]}
                </button>
              ))}
            </div>

            {/* Interactive Map Picker */}
            <div className="h-48 sm:h-56 rounded-2xl overflow-hidden border border-slate-200">
              <MapView
                issues={[]}
                center={[latitude, longitude]}
                zoom={14}
                onMapClick={handleMapPin}
                pickerMarker={{ lat: latitude, lng: longitude }}
                height="100%"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 450 Oak Street"
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Landmark (Optional)</label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Opposite Community Library"
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>
            </div>
          </div>

          {/* STEP 5: REAL-TIME DUPLICATE WARNING MODAL / CALLOUT */}
          {duplicateWarning && (
            <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 shadow-sm animate-in slide-in-from-top-2">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-extrabold text-amber-950">
                    ⚠️ Possible Duplicate Report Detected Nearby!
                  </h4>
                  <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                    An existing active report (<strong>#{duplicateWarning.top_match_id}</strong>) was located within {Math.round(duplicateWarning.potential_matches[0]?.distance_meters)} meters with a {duplicateWarning.potential_matches[0]?.similarity_score}% similarity index.
                  </p>

                  <div className="mt-3 bg-white/90 p-3 rounded-xl border border-amber-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">
                        #{duplicateWarning.top_match_id}: {duplicateWarning.potential_matches[0]?.title}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        📍 {duplicateWarning.potential_matches[0]?.address}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-amber-900 font-semibold mt-2">
                    💡 You may still submit your report. It will be flagged as supporting evidence rather than deleted, allowing staff to group the reports.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: REPORTER DETAILS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Your Name (Optional)</label>
              <input
                type="text"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                placeholder="e.g. John Doe / Resident"
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl p-2.5"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Contact Email / Phone (Optional)</label>
              <input
                type="text"
                value={reporterContact}
                onChange={(e) => setReporterContact(e.target.value)}
                placeholder="For status updates"
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl p-2.5"
              />
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-civic-600 hover:bg-civic-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-civic-600/30 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>Submitting & Generating Audit Record...</>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Civic Report & Begin Evidence Trail</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>

    </div>
  );
}
