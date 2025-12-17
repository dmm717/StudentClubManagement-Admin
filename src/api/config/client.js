import axios from 'axios';
import { showError } from '../../utils/notifications';
import { API_BASE_URL } from './constants';

// Tạo axios instance với cấu hình mặc định
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor - Tự động thêm JWT token vào header
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

// Response Interceptor - Xử lý errors tự động
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('adminUser');
        window.location.href = '/admin/login';
      } else if (error.response.status === 403) {
        showError('Bạn không có quyền thực hiện hành động này!', 'Không có quyền');
      }
    }
    return Promise.reject(error);
  }
);

export default api;


