import axios from 'axios';
import { showError } from '../../utils/notifications';
import { API_BASE_URL } from './constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Thêm token vào header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Xử lý lỗi và redirect khi cần
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;
      
      if (status === 401) {
        // Unauthorized: Xóa token và redirect về trang login
        localStorage.removeItem('token');
        localStorage.removeItem('adminUser');
        window.location.href = '/admin/login';
      } else if (status === 403) {
        // Forbidden: Hiển thị thông báo không có quyền
        showError('Bạn không có quyền thực hiện hành động này!', 'Không có quyền');
      }
    }
    return Promise.reject(error);
  }
);

export default api;

