/**
 * API Client Configuration
 * 
 * Mục đích:
 * - Tạo và cấu hình axios instance để gọi API
 * - Xử lý authentication tự động (thêm token vào header)
 * - Xử lý lỗi tập trung (401, 403, etc.)
 * - Đảm bảo tất cả request đều có format JSON
 * 
 * Tính năng chính:
 * 1. Request Interceptor: Tự động thêm JWT token vào Authorization header
 * 2. Response Interceptor: Xử lý lỗi HTTP và redirect khi cần
 * 
 * Cách sử dụng:
 * import api from '@/api/config/client';
 * api.get('/endpoint');
 * api.post('/endpoint', data);
 * 
 * @module api/config/client
 */

import axios from 'axios';
import { showError } from '../../utils/notifications';
import { API_BASE_URL } from './constants';

/**
 * Tạo axios instance với cấu hình mặc định
 * - baseURL: URL gốc của API (từ constants)
 * - headers: Mặc định Content-Type là application/json
 * 
 * @constant {AxiosInstance} api
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * 
 * Mục đích: Tự động thêm JWT token vào Authorization header của mọi request
 * 
 * Cách hoạt động:
 * 1. Lấy token từ localStorage (nếu có)
 * 2. Nếu có token → thêm vào header: Authorization: Bearer <token>
 * 3. Nếu không có token → request vẫn được gửi nhưng không có authentication
 * 
 * Lưu ý:
 * - Token được lưu trong localStorage với key 'token'
 * - Format: Bearer token (theo chuẩn JWT)
 * 
 * @param {Object} config - Axios request config
 * @returns {Object} Config đã được thêm token (nếu có)
 */
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

/**
 * Response Interceptor
 * 
 * Mục đích: Xử lý lỗi HTTP tập trung và tự động redirect khi cần
 * 
 * Các trường hợp xử lý:
 * 1. 401 Unauthorized:
 *    - Xóa token và thông tin user khỏi localStorage
 *    - Redirect về trang login (/admin/login)
 *    - Ngăn chặn truy cập trái phép
 * 
 * 2. 403 Forbidden:
 *    - Hiển thị thông báo lỗi "Không có quyền"
 *    - Không redirect, chỉ thông báo cho user
 * 
 * 3. Các lỗi khác:
 *    - Reject promise để component có thể xử lý riêng
 * 
 * @param {Object} response - Axios success response
 * @param {Object} error - Axios error object
 * @returns {Promise} Response hoặc rejected promise
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;
      
      // 401: Token không hợp lệ hoặc đã hết hạn
      if (status === 401) {
        // Xóa dữ liệu authentication
        localStorage.removeItem('token');
        localStorage.removeItem('adminUser');
        // Redirect về trang login
        window.location.href = '/admin/login';
      } 
      // 403: User không có quyền truy cập resource này
      else if (status === 403) {
        showError('Bạn không có quyền thực hiện hành động này!', 'Không có quyền');
      }
    }
    // Reject để component có thể catch và xử lý riêng
    return Promise.reject(error);
  }
);

export default api;

