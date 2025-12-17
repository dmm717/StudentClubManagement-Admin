import api from '../config/client';

// Auth APIs - Xác thực người dùng
export const authAPI = {
  // Đăng nhập
  // API: POST /api/auth/login
  // @param {string} username - Tên đăng nhập
  // @param {string} password - Mật khẩu
  // @returns {Promise} - Response chứa token và thông tin user
  login: (username, password) => {
    return api.post('/auth/login', { username, password });
  },
};


