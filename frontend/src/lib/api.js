// Centralized API helper — uses Vite env var VITE_API_BASE when available.
// Default behavior:
// - during local `vite` dev (import.meta.env.DEV === true) default to http://localhost:8000
// - in production (import.meta.env.PROD) default to https://ecokuza.onrender.com

const DEFAULT_PROD_BACKEND = 'https://ecokuza.onrender.com';
const DEFAULT_DEV_BACKEND = 'http://localhost:8000';

export const API_BASE = (() => {
  // Vite exposes env vars as import.meta.env.VITE_*
  const envBase = import.meta.env.VITE_API_BASE;
  if (envBase) return envBase.replace(/\/$/, ''); // strip trailing slash
  return import.meta.env.DEV ? DEFAULT_DEV_BACKEND : DEFAULT_PROD_BACKEND;
})();

export const ENDPOINTS = {
  AUTH_SIGNIN: `${API_BASE}/authentification/signin/`,
  AUTH_SIGNUP: `${API_BASE}/authentification/signup/`,
  // add other endpoints here as needed
};

export async function apiCall(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  // attach JWT token if present
  const access = localStorage.getItem('access_token');
  if (access) headers['Authorization'] = `Bearer ${access}`;

  const res = await fetch(url, { ...options, headers });
  let payload = null;
  const text = await res.text();
  try { payload = text ? JSON.parse(text) : null; } catch (e) { payload = text; }

  if (!res.ok) {
    const err = new Error(payload?.detail || payload?.error || res.statusText || 'API error');
    err.status = res.status;
    err.payload = payload;
    throw err;
  }

  return payload;
}
