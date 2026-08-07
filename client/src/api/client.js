import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 12000,
});

// Attach the admin JWT when present
api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem('pf_auth');
    if (raw) {
      const { token } = JSON.parse(raw);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    /* ignore */
  }
  return config;
});

// On 401 (expired/invalid token) clear local auth and notify the app
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && err.config?.url !== '/auth/login') {
      localStorage.removeItem('pf_auth');
      window.dispatchEvent(new Event('pf-auth-expired'));
    }
    return Promise.reject(err);
  }
);

export default api;
