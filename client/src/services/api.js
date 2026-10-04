// Thin fetch wrapper around the Express API. Cookies carry the admin session (httpOnly),
// so no token ever lives in JS. Set VITE_API_URL only if the API runs on another origin.

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function request(path, { method = 'GET', body, signal, isForm } = {}) {
  // Offline preview build only (VITE_DEMO=true); removed from normal builds.
  if (import.meta.env.VITE_DEMO === 'true') {
    const { demoRequest } = await import('./demo.js');
    return demoRequest(path, { method, body });
  }
  const res = await fetch(`${API_BASE}/api${path}`, {
    method,
    credentials: 'include',
    signal,
    headers: body && !isForm ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  });
  let json = null;
  try { json = await res.json(); } catch { /* empty body */ }
  if (!res.ok || !json?.success) {
    throw new ApiError(json?.error?.message || `Request failed (${res.status})`, res.status, json?.error?.details);
  }
  return json.data;
}

const qs = (params = {}) => {
  const s = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null)).toString();
  return s ? `?${s}` : '';
};

/** Resolve an image path from the API (uploads are served by the server). */
export const assetUrl = (src) => (src && src.startsWith('/uploads/') ? `${API_BASE}${src}` : src || '');

export const api = {
  // auth
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request('/auth/me'),

  // music
  listMusic: (params, signal) => request(`/music${qs(params)}`, { signal }),
  getMusic: (slug, signal) => request(`/music/${encodeURIComponent(slug)}`, { signal }),
  createMusic: (data) => request('/music', { method: 'POST', body: data }),
  updateMusic: (id, data) => request(`/music/${id}`, { method: 'PUT', body: data }),
  deleteMusic: (id) => request(`/music/${id}`, { method: 'DELETE' }),

  // videos
  listVideos: (params, signal) => request(`/videos${qs(params)}`, { signal }),
  createVideo: (data) => request('/videos', { method: 'POST', body: data }),
  updateVideo: (id, data) => request(`/videos/${id}`, { method: 'PUT', body: data }),
  deleteVideo: (id) => request(`/videos/${id}`, { method: 'DELETE' }),

  // biography
  getAbout: (signal) => request('/about', { signal }),
  updateAbout: (data) => request('/about', { method: 'PUT', body: data }),

  // contact
  sendInquiry: (data) => request('/contact', { method: 'POST', body: data }),
  listInquiries: (params) => request(`/contact${qs(params)}`),
  updateInquiry: (id, status) => request(`/contact/${id}`, { method: 'PATCH', body: { status } }),
  deleteInquiry: (id) => request(`/contact/${id}`, { method: 'DELETE' }),

  // settings
  getSettings: (signal) => request('/settings', { signal }),
  getRawSettings: () => request('/settings?raw=true'),
  updateSettings: (data) => request('/settings', { method: 'PUT', body: data }),

  // admin
  stats: () => request('/stats'),
  uploadModel: (file) => {
    const fd = new FormData();
    fd.append('model', file);
    return request('/uploads/model', { method: 'POST', body: fd, isForm: true });
  },
  uploadImage: (file, kind = 'photo') => {
    const fd = new FormData();
    fd.append('image', file);
    return request(`/uploads?kind=${kind}`, { method: 'POST', body: fd, isForm: true });
  },
};
