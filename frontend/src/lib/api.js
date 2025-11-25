// Centralized API helper — intelligently configures backend URL based on environment.
// Handles local dev (http), Vercel (https), and Render (https) seamlessly.

const getAPIBase = () => {
  const envBase = import.meta.env.VITE_API_BASE;
  if (envBase) return envBase.replace(/\/$/, '');

  // Production: use https://render backend
  if (import.meta.env.PROD) {
    return 'https://ecokuza.onrender.com';
  }

  // Development: intelligently detect protocol
  // If frontend is on https (e.g., ngrok), use https backend
  // If frontend is on http (localhost), use http backend
  const frontendProtocol = window.location.protocol; // http: or https:
  const host = window.location.hostname;

  // Always use http for localhost (dev server)
  if (host === 'localhost' || host === '127.0.0.1') {
    return 'http://localhost:8000';
  }

  // For other dev environments (ngrok, etc.), match the protocol
  const backendProtocol = frontendProtocol === 'https:' ? 'https:' : 'http:';
  return `${backendProtocol}//localhost:8000`;
};

export const API_BASE = getAPIBase();

export const ENDPOINTS = {
  AUTH_SIGNIN: `${API_BASE}/authentification/signin/`,
  AUTH_SIGNUP: `${API_BASE}/authentification/signup/`,
  TREES_RECORDS: `${API_BASE}/trees/records/`,
  NOTIFICATIONS: `${API_BASE}/authentification/notifications/`,
  LEADERBOARD: `${API_BASE}/authentification/leaderboard/`,
  CERTIFICATIONS: `${API_BASE}/authentification/certifications/`,
};

export async function apiCall(url, options = {}) {
  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {}),
  };

  // Attach JWT token only for authenticated endpoints
  // Don't attach for login/signup which are public endpoints
  const publicEndpoints = ['/signin/', '/signup/', '/forgot-password/', '/reset-password/', '/leaderboard/'];
  const isPublicEndpoint = publicEndpoints.some(ep => url.includes(ep));
  
  const access = localStorage.getItem('access_token');
  if (access && !isPublicEndpoint) {
    headers['Authorization'] = `Bearer ${access}`;
  }

  try {
    const res = await fetch(url, { ...options, headers });
    let payload = null;
    const text = await res.text();
    try { 
      payload = text ? JSON.parse(text) : null; 
    } catch {
      payload = text; 
    }

    if (!res.ok) {
      const err = new Error(payload?.detail || payload?.error || res.statusText || 'API error');
      err.status = res.status;
      err.payload = payload;
      throw err;
    }

    return res;
  } catch (err) {
    console.error(`API call failed to ${url}:`, err);
    throw err;
  }
}


