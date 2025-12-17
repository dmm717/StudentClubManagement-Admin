import api from '../config/client';

// Account APIs (Admin) - Quản lý tài khoản (chỉ admin)
export const accountsAPI = {
  // Lấy danh sách tất cả tài khoản
  // API: GET /api/admin/accounts
  // @returns {Promise} - Danh sách accounts
  getAll: () => {
    return api.get('/admin/accounts');
  },
  // Lấy thông tin chi tiết một tài khoản
  // API: GET /api/admin/accounts/{id}
  getById: (id) => {
    return api.get(`/admin/accounts/${id}`);
  },
  // Khóa tài khoản
  // API: PUT /api/admin/accounts/{id}/lock
  lock: (id) => {
    return api.put(`/admin/accounts/${id}/lock`);
  },
  // Kích hoạt tài khoản
  // API: PUT /api/admin/accounts/{id}/activate
  activate: (id) => {
    return api.put(`/admin/accounts/${id}/activate`);
  },
  // Reset mật khẩu tài khoản
  // API: PUT /api/admin/accounts/{id}/reset-password
  resetPassword: (id, newPassword) => {
    return api.put(`/admin/accounts/${id}/reset-password`, { newPassword });
  },
  // Thêm vai trò cho tài khoản
  // API: POST /api/admin/accounts/{id}/roles
  addRole: (id, roleData) => {
    return api.post(`/admin/accounts/${id}/roles`, roleData);
  },
  // Xóa vai trò khỏi tài khoản
  // API: DELETE /api/admin/accounts/{id}/roles
  removeRole: (id, roleData) => {
    return api.delete(`/admin/accounts/${id}/roles`, { data: roleData });
  },
};


