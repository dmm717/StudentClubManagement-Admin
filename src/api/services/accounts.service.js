/**
 * Accounts API Service
 * 
 * Được sử dụng bởi:
 * - src/pages/admin/Accounts.jsx (getAll, getById, lock, activate, resetPassword, addRole, removeRole)
 * - src/pages/admin/Requests.jsx (getById - để lấy thông tin account khi hiển thị request)
 * - src/pages/admin/Dashboard.jsx (getAll - để thống kê)
 */
import api from '../config/client';

export const accountsAPI = {
  /**
   * Lấy danh sách tất cả tài khoản
   * @returns {Promise} Response từ API
   * 
   * Sử dụng tại:
   * - src/pages/admin/Accounts.jsx
   * - src/pages/admin/Dashboard.jsx (để thống kê)
   */
  getAll: () => api.get('/admin/accounts'),
  
  /**
   * Lấy thông tin chi tiết của một tài khoản
   * @param {number} id - ID của tài khoản
   * @returns {Promise} Response từ API
   * 
   * Sử dụng tại:
   * - src/pages/admin/Accounts.jsx
   * - src/pages/admin/Requests.jsx (để lấy thông tin account trong request)
   */
  getById: (id) => api.get(`/admin/accounts/${id}`),
  
  /**
   * Khóa tài khoản
   * @param {number} id - ID của tài khoản
   * @returns {Promise} Response từ API
   * 
   * Sử dụng tại: src/pages/admin/Accounts.jsx
   */
  lock: (id) => api.put(`/admin/accounts/${id}/lock`),
  
  /**
   * Kích hoạt tài khoản
   * @param {number} id - ID của tài khoản
   * @returns {Promise} Response từ API
   * 
   * Sử dụng tại: src/pages/admin/Accounts.jsx
   */
  activate: (id) => api.put(`/admin/accounts/${id}/activate`),
  
  /**
   * Đặt lại mật khẩu cho tài khoản
   * @param {number} id - ID của tài khoản
   * @param {string} newPassword - Mật khẩu mới
   * @returns {Promise} Response từ API
   * 
   * Sử dụng tại: src/pages/admin/Accounts.jsx
   */
  resetPassword: (id, newPassword) => 
    api.put(`/admin/accounts/${id}/reset-password`, { newPassword }),
  
  /**
   * Thêm role cho tài khoản
   * @param {number} id - ID của tài khoản
   * @param {Object} roleData - Dữ liệu role (ví dụ: { roleName: 'Admin' })
   * @returns {Promise} Response từ API
   * 
   * Sử dụng tại: src/pages/admin/Accounts.jsx
   */
  addRole: (id, roleData) => 
    api.post(`/admin/accounts/${id}/roles`, roleData),
  
  /**
   * Xóa role khỏi tài khoản
   * @param {number} id - ID của tài khoản
   * @param {Object} roleData - Dữ liệu role cần xóa (ví dụ: { roleName: 'Admin' })
   * @returns {Promise} Response từ API
   * 
   * Sử dụng tại: src/pages/admin/Accounts.jsx
   */
  removeRole: (id, roleData) => 
    api.delete(`/admin/accounts/${id}/roles`, { data: roleData }),
};

