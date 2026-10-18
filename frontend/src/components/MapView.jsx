import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { CATEGORIES, SEVERITIES, STATUS_CONFIG } from '../utils/helpers';

// Helper to generate custom SVG HTML markers for Leaflet
function createCategoryMarkerIcon(category, severity, status, isDuplicate) {
  const cat = CATEGORIES[category] || CATEGORIES.potholes;
  const pinColor = cat.color;
  const isResolved = status === 'resolved';

  let iconSvg = '';
  if (category === 'potholes') {
    iconSvg = `<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4m0 4h.01" stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  } else if (category === 'waste') {
    iconSvg = `<path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2m-6 5v6m4-6v6" stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  } else if (category === 'broken_streetlights') {
    iconSvg = `<path d="M9 18h6m-4 4h2m-7-9a6 6 0 1 1 8 0c-.5.5-1 1.5-1 2.5v.5h-6v-.5c0-1-.5-2-1-2.5z" stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  } else {
    // water_leaks
    iconSvg = `<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  }

  const borderClass = isDuplicate ? 'border-2 border-indigo-500' : 'border-2 border-white';
  const pulseClass = (severity === 'critical' && !isResolved) ? 'animate-pulse' : '';

  const html = `
    <div class="relative flex items-center justify-center cursor-pointer group">
      ${(severity === 'critical' && !isResolved) ? `
        <span class="absolute -inset-1 rounded-full bg-rose-500/40 animate-ping"></span>
      ` : ''}
      <div 
        style="background-color: ${pinColor};" 
        class="w-9 h-9 rounded-full flex items-center justify-center shadow-lg ${borderClass} ${pulseClass} transition-transform transform group-hover:scale-110"
      >
        <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none">
          ${iconSvg}
        </svg>
      </div>
      <div 
        style="border-top-color: ${pinColor};"
        class="absolute -bottom-1.5 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px]"
      ></div>
    </div>
  `;

  return L.divIcon({
    html: html,
    className: 'custom-civic-pin',
    iconSize: [36, 42],
    iconAnchor: [18, 40],
    popupAnchor: [0, -38]
  });
}

export default function MapView({ 
  issues, 
  selectedIssue, 
  onSelectIssue, 
  center = [37.7750, -122.4180], 
  zoom = 14,
  onMapClick,
  pickerMarker = null,
  height = '100%'
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const pickerMarkerRef = useRef(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: center,
      zoom: zoom,
      scrollWheelZoom: true,
      zoomControl: true
    });

    // Clean OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);

    if (onMapClick) {
      map.on('click', (e) => {
        onMapClick(e.latlng.lat, e.latlng.lng);
      });
    }

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update center when prop changes
  useEffect(() => {
    if (mapInstanceRef.current && center) {
      mapInstanceRef.current.setView(center, zoom);
    }
  }, [center?.[0], center?.[1], zoom]);

  // Handle Resize
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [height]);

  // Handle Issues markers update
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    if (!issues || issues.length === 0) return;

    issues.forEach((issue) => {
      const isDuplicate = issue.duplicate_status === 'flagged';
      const icon = createCategoryMarkerIcon(
        issue.category, 
        issue.severity, 
        issue.status, 
        isDuplicate
      );

      const marker = L.marker([issue.latitude, issue.longitude], { icon });

      const cat = CATEGORIES[issue.category] || CATEGORIES.potholes;
      const statusCfg = STATUS_CONFIG[issue.status] || STATUS_CONFIG.submitted;
      const sevCfg = SEVERITIES[issue.severity] || SEVERITIES.medium;

      // Popup HTML
      const popupHtml = `
        <div class="w-64 p-3 font-sans text-left">
          <div class="relative h-28 w-full mb-2.5 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
            <img 
              src="${issue.image_url}" 
              alt="${issue.title}" 
              class="w-full h-full object-cover" 
              onerror="this.src='https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=400&q=80'"
            />
            <div class="absolute top-2 left-2 flex items-center gap-1">
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs ${cat.badgeClass}">
                ${cat.shortLabel}
              </span>
            </div>
            <div class="absolute top-2 right-2">
              <span class="text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-xs ${sevCfg.badgeClass}">
                ${sevCfg.label}
              </span>
            </div>
          </div>

          <div class="flex items-center justify-between text-[11px] text-slate-500 mb-1">
            <span class="font-mono font-bold text-civic-700">#${issue.id}</span>
            <span class="px-1.5 py-0.5 rounded text-[10px] font-semibold ${statusCfg.badgeClass}">
              ${statusCfg.label}
            </span>
          </div>

          <h4 class="text-xs font-bold text-slate-900 line-clamp-2 mb-1 leading-snug">
            ${issue.title}
          </h4>

          <p class="text-[11px] text-slate-500 line-clamp-1 mb-2">
            📍 ${issue.address}
          </p>

          ${isDuplicate ? `
            <div class="mb-2.5 px-2 py-1 rounded bg-indigo-50 border border-indigo-200 text-indigo-800 text-[10px] font-semibold flex items-center gap-1">
              <span>⚠️ Flagged duplicate (${Math.round((issue.duplicate_confidence || 0.85)*100)}% match)</span>
            </div>
          ` : ''}

          <button 
            id="view-issue-${issue.id}" 
            class="w-full text-center py-1.5 px-2 bg-civic-600 hover:bg-civic-700 text-white font-bold text-xs rounded-lg transition-colors shadow-xs"
          >
            Inspect Evidence & Trail →
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 280 });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-issue-${issue.id}`);
        if (btn) {
          btn.onclick = () => {
            if (onSelectIssue) onSelectIssue(issue);
          };
        }
      });

      markersLayerRef.current.addLayer(marker);
    });

  }, [issues, onSelectIssue]);

  // Handle single picker marker (for reporting modal)
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (pickerMarker) {
      if (pickerMarkerRef.current) {
        pickerMarkerRef.current.setLatLng([pickerMarker.lat, pickerMarker.lng]);
      } else {
        const icon = L.divIcon({
          html: `
            <div class="relative flex items-center justify-center">
              <span class="absolute -inset-1 rounded-full bg-civic-500/40 animate-ping"></span>
              <div class="w-8 h-8 rounded-full bg-civic-600 border-2 border-white flex items-center justify-center shadow-lg text-white font-bold text-sm">
                📍
              </div>
            </div>
          `,
          className: 'picker-pin',
          iconSize: [32, 32],
          iconAnchor: [16, 32]
        });
        pickerMarkerRef.current = L.marker([pickerMarker.lat, pickerMarker.lng], { icon }).addTo(mapInstanceRef.current);
      }
      mapInstanceRef.current.panTo([pickerMarker.lat, pickerMarker.lng]);
    } else if (pickerMarkerRef.current) {
      pickerMarkerRef.current.remove();
      pickerMarkerRef.current = null;
    }
  }, [pickerMarker]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200/90 shadow-xs bg-slate-100" style={{ height }}>
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-xl shadow-md border border-slate-200/90 text-[11px] font-medium hidden sm:flex items-center gap-3">
        <span className="font-bold text-slate-700">Map Legend:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-600"></span>
          <span>Pothole</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-green-600"></span>
          <span>Waste</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span>Streetlight</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span>
          <span>Water Leak</span>
        </div>
      </div>
    </div>
  );
}
