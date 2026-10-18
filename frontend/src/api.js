const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export async function fetchIssues(filters = {}) {
  const query = new URLSearchParams();
  if (filters.category && filters.category !== 'all') query.append('category', filters.category);
  if (filters.status && filters.status !== 'all') query.append('status', filters.status);
  if (filters.severity && filters.severity !== 'all') query.append('severity', filters.severity);
  if (filters.search) query.append('search', filters.search);
  if (filters.duplicatesOnly) query.append('duplicates_only', 'true');

  const res = await fetch(`${API_BASE}/issues?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to load issues');
  return res.json();
}

export async function fetchIssueById(id) {
  const res = await fetch(`${API_BASE}/issues/${id}`);
  if (!res.ok) throw new Error('Failed to load issue details');
  return res.json();
}

export async function createIssue(payload) {
  const res = await fetch(`${API_BASE}/issues`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to submit issue report');
  }
  return res.json();
}

export async function updateIssueStatus(id, { status, changed_by, notes, assigned_department, assigned_person, resolution_notes, resolution_image_url }) {
  const res = await fetch(`${API_BASE}/issues/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status,
      changed_by,
      notes,
      assigned_department,
      assigned_person,
      resolution_notes,
      resolution_image_url
    })
  });
  if (!res.ok) throw new Error('Failed to update status');
  return res.json();
}

export async function updateIssueClassification(id, { category, override_reason, severity, changed_by }) {
  const res = await fetch(`${API_BASE}/issues/${id}/classification`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      category,
      override_reason,
      severity,
      changed_by
    })
  });
  if (!res.ok) throw new Error('Failed to update classification');
  return res.json();
}

export async function updateDuplicateFlag(id, { duplicate_status, notes, changed_by }) {
  const res = await fetch(`${API_BASE}/issues/${id}/duplicate`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      duplicate_status,
      notes,
      changed_by
    })
  });
  if (!res.ok) throw new Error('Failed to update duplicate status');
  return res.json();
}

export async function upvoteIssue(id) {
  const res = await fetch(`${API_BASE}/issues/${id}/upvote`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to upvote');
  return res.json();
}

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/issues/upload`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) throw new Error('Failed to upload image');
  return res.json();
}

export async function classifyAI({ title, description, image_name }) {
  const res = await fetch(`${API_BASE}/ai/classify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description, image_name })
  });
  if (!res.ok) throw new Error('AI classification failed');
  return res.json();
}

export async function checkDuplicatesAI({ latitude, longitude, category, title, description, exclude_id }) {
  const res = await fetch(`${API_BASE}/ai/check-duplicates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ latitude, longitude, category, title, description, exclude_id })
  });
  if (!res.ok) throw new Error('Duplicate check failed');
  return res.json();
}

export async function fetchAnalytics() {
  const res = await fetch(`${API_BASE}/analytics`);
  if (!res.ok) throw new Error('Failed to load analytics');
  return res.json();
}

export async function resetDemoData() {
  const res = await fetch(`${API_BASE}/demo/reset-seed`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to reset demo data');
  return res.json();
}
