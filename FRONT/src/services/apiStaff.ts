import axios from 'axios';

const apiStaff = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

apiStaff.interceptors.request.use((config) => {
  const staffToken = localStorage.getItem('staff_token');
  if (staffToken) {
    config.headers.Authorization = `Bearer ${staffToken}`;
  }
  return config;
});

apiStaff.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const cachedStaff = localStorage.getItem('staff_user');
      if (!cachedStaff) {
        localStorage.removeItem('staff_token');
        localStorage.removeItem('staff_user');
        window.location.href = '/staff-login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiStaff;
