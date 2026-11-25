import axios from 'axios';
export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000', headers: { 'Content-Type': 'application/json' } });
api.interceptors.request.use(config => { const token = localStorage.getItem('accessToken'); if (token) config.headers.Authorization = `Bearer ${token}`; return config; });
api.interceptors.response.use(r => r, error => { if (error.response?.status === 401 && !location.pathname.startsWith('/login')) { localStorage.removeItem('accessToken'); location.href = '/login'; } return Promise.reject(error); });
