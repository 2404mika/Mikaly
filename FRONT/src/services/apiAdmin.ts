import axios from 'axios';

const apiAdmin = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

apiAdmin.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem('admin_token');
  if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  }
  return config;
});

apiAdmin.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const cachedAdmin = localStorage.getItem('admin_user');
      if (!cachedAdmin) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiAdmin;
