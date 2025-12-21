/**
 * Authentication API Service
 * 
 * Được sử dụng bởi:
 * - src/pages/admin/Login.jsx (login)
 */
import api from '../config/client';

export const authAPI = {
  /**
   * Đăng nhập admin
   * @param {string} username - Tên đăng nhập
   * @param {string} password - Mật khẩu
   * @returns {Promise} Response từ API
   * 
   * Sử dụng tại: src/pages/admin/Login.jsx
   */
  login: (username, password) => {
    return api.post('/auth/login', { username, password });
  },
};


