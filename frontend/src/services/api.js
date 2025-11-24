import axios from 'axios';

// Create axios instance with base URL from environment variables
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API methods
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
};

export const activitiesApi = {
  getAll: (params = {}) => api.get('/activities', { params }),
  getById: (id) => api.get(`/activities/${id}`),
  create: (data) => api.post('/activities', data),
  update: (id, data) => api.put(`/activities/${id}`, data),
  delete: (id) => api.delete(`/activities/${id}`),
};

export const treesApi = {
  getAll: (params = {}) => api.get('/trees', { params }),
  getById: (id) => api.get(`/trees/${id}`),
  create: (data) => api.post('/trees', data),
  update: (id, data) => api.put(`/trees/${id}`, data),
  delete: (id) => api.delete(`/trees/${id}`),
  getStats: () => api.get('/trees/stats'),
};

export const leaderboardApi = {
  getGlobal: () => api.get('/leaderboard/global'),
  getByRegion: (regionId) => api.get(`/leaderboard/region/${regionId}`),
};

// Add more API endpoints as needed
export default api;
