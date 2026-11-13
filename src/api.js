import axios from 'axios';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const authAxios = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});
authAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authAPI = {
  login: (email, password) => authAxios.post('/api/ticketing/auth/login', { email, password }),
  register: (data) => authAxios.post('/api/ticketing/auth/register', data),
  // NEW — Google sign-in (returns our JWT + user; may create a new user on the fly)
  googleLogin: (idToken) => authAxios.post('/api/google', { id_token: idToken }),
};

export const accreditationAPI = {
  getTypes: () => api.get('/accreditation/types'),
  getMatches: () => api.get('/accreditation/matches'),
  getCountries: () => api.get('/countries/'),

  apply: (data) => api.post('/accreditation/apply', data),
  myAccreditations: () => api.get('/accreditation/my'),
  myAccreditation: (id) => api.get(`/accreditation/my/${id}`),
  updateMy: (id, data) => api.put(`/accreditation/my/${id}`, data),
  withdrawMy: (id) => api.delete(`/accreditation/my/${id}`),

  uploadPhoto: (formData) =>
    api.post('/accreditation/upload-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  verify: (token) => api.get(`/accreditation/verify/${token}`),
  checkIn: (token) => api.put(`/accreditation/verify/${token}/check-in`),
  resendCard: (id) => api.post(`/accreditation/my/${id}/resend-card`),
};

export default api;