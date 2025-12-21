/**
 * Authentication API Service
 * 
 * Mục đích:
 * - Xử lý các API liên quan đến xác thực người dùng (authentication)
 * - Cung cấp các hàm để đăng nhập, đăng xuất (nếu có)
 * 
 * Endpoint sử dụng:
 * - POST /auth/login: Đăng nhập admin
 * 
 * Được sử dụng bởi:
 * - src/pages/admin/Login.jsx: Sử dụng hàm login() để đăng nhập
 * 
 * Response format:
 * - Success: { token: string, user: object }
 * - Error: { message: string, status: number }
 * 
 * @module api/services/auth.service
 */
import api from '../config/client';

export const authAPI = {
  /**
   * Đăng nhập admin vào hệ thống
   * 
   * Mục đích:
   * - Xác thực thông tin đăng nhập (username, password)
   * - Nhận JWT token từ server để sử dụng cho các request sau
   * 
   * @param {string} username - Tên đăng nhập của admin
   * @param {string} password - Mật khẩu của admin (plain text, sẽ được mã hóa bởi server)
   * 
   * @returns {Promise<Object>} Promise chứa response từ API
   * @returns {string} returns.token - JWT token để xác thực các request sau
   * @returns {Object} returns.user - Thông tin user đã đăng nhập
   * 
   * @example
   * try {
   *   const response = await authAPI.login('admin', 'password123');
   *   localStorage.setItem('token', response.data.token);
   * } catch (error) {
   *   console.error('Login failed:', error);
   * }
   * 
   * Sử dụng tại:
   * - src/pages/admin/Login.jsx: Gọi khi user submit form đăng nhập
   * 
   * Lưu ý:
   * - Token nhận được cần được lưu vào localStorage để sử dụng cho các request sau
   * - Request này KHÔNG cần token (vì đây là bước đầu tiên để lấy token)
   */
  login: (username, password) => {
    return api.post('/auth/login', { username, password });
  },
};


