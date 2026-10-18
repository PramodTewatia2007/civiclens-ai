export const CATEGORIES = {
  potholes: {
    id: 'potholes',
    label: 'Potholes & Road Hazard',
    shortLabel: 'Pothole',
    color: '#ea580c', // orange-600
    bgLight: 'bg-orange-50',
    borderLight: 'border-orange-200',
    textDark: 'text-orange-800',
    badgeClass: 'bg-orange-100 text-orange-800 border-orange-200',
    iconName: 'AlertTriangle'
  },
  waste: {
    id: 'waste',
    label: 'Illegal Dumping & Waste',
    shortLabel: 'Waste',
    color: '#16a34a', // green-600
    bgLight: 'bg-green-50',
    borderLight: 'border-green-200',
    textDark: 'text-green-800',
    badgeClass: 'bg-green-100 text-green-800 border-green-200',
    iconName: 'Trash2'
  },
  broken_streetlights: {
    id: 'broken_streetlights',
    label: 'Broken Streetlights & Electrical',
    shortLabel: 'Streetlight',
    color: '#eab308', // yellow-500
    bgLight: 'bg-amber-50',
    borderLight: 'border-amber-200',
    textDark: 'text-amber-800',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    iconName: 'LightbulbOff'
  },
  water_leaks: {
    id: 'water_leaks',
    label: 'Water Leaks & Pipe Bursts',
    shortLabel: 'Water Leak',
    color: '#0284c7', // sky-600
    bgLight: 'bg-sky-50',
    borderLight: 'border-sky-200',
    textDark: 'text-sky-800',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-200',
    iconName: 'Droplets'
  }
};

export const SEVERITIES = {
  low: {
    label: 'Low',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    dotClass: 'bg-slate-400'
  },
  medium: {
    label: 'Medium',
    badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
    dotClass: 'bg-blue-500'
  },
  high: {
    label: 'High',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    dotClass: 'bg-amber-500'
  },
  critical: {
    label: 'Critical',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse',
    dotClass: 'bg-rose-600'
  }
};

export const STATUS_STEPS = [
  { id: 'submitted', label: 'Submitted', stepIndex: 1 },
  { id: 'under_review', label: 'Under Review', stepIndex: 2 },
  { id: 'assigned', label: 'Assigned', stepIndex: 3 },
  { id: 'in_progress', label: 'In Progress', stepIndex: 4 },
  { id: 'resolved', label: 'Resolved', stepIndex: 5 }
];

export const STATUS_CONFIG = {
  submitted: {
    label: 'Submitted',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
    stepNumber: 1
  },
  under_review: {
    label: 'Under Review',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
    stepNumber: 2
  },
  assigned: {
    label: 'Assigned',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
    stepNumber: 3
  },
  in_progress: {
    label: 'In Progress',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
    stepNumber: 4
  },
  resolved: {
    label: 'Resolved',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    stepNumber: 5
  }
};

export const CIVIC_HOTSPOTS = [
  {
    name: 'Civic Center & Library Plaza',
    address: '450 Oak Street, Civic Center',
    lat: 37.7750,
    lng: -122.4193
  },
  {
    name: 'Westgate Metro Plaza',
    address: '810 Elm Street & 6th Ave',
    lat: 37.7782,
    lng: -122.4215
  },
  {
    name: 'Market Street Commercial Alley',
    address: '1120 Market Street Alleyway',
    lat: 37.7712,
    lng: -122.4140
  },
  {
    name: 'University Campus Walkway',
    address: 'University Avenue, North Campus',
    lat: 37.7815,
    lng: -122.4168
  },
  {
    name: 'Central Green Public Park',
    address: 'Central Green Park, Pine St Entrance',
    lat: 37.7698,
    lng: -122.4260
  }
];

export const SAMPLE_PHOTOS = [
  {
    label: 'Road Pothole',
    category: 'potholes',
    title: 'Damaged Asphalt & Deep Pothole',
    description: 'Cracked asphalt hole near bike lane causing tire deflection and pedestrian trip hazard.',
    url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80'
  },
  {
    label: 'Waste Dumping',
    category: 'waste',
    title: 'Commercial Dumping & Abandoned Trash Bags',
    description: 'Bulk rubbish and discarded boxes left on public pavement obstructing pedestrian walkway.',
    url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80'
  },
  {
    label: 'Dark Streetlight',
    category: 'broken_streetlights',
    title: 'Extinguished Overhead Streetlight',
    description: 'Lamp fixture unlit along residential block creating complete darkness after sunset.',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80'
  },
  {
    label: 'Gushing Water Leak',
    category: 'water_leaks',
    title: 'Underground Water Pipe Rupture',
    description: 'Steady water flow pooling into street gutter from subterranean water supply break.',
    url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f8?auto=format&fit=crop&w=800&q=80'
  }
];

export function formatDate(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatRelativeTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 30) return `${diffInDays}d ago`;
  return formatDate(dateString);
}
