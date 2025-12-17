import api from '../config/client';

// Clubs APIs - Quản lý câu lạc bộ
export const clubsAPI = {
  // Lấy danh sách tất cả clubs
  // API: GET /api/clubs
  // @returns {Promise} - Danh sách clubs
  getAll: () => {
    return api.get('/clubs');
  },
  // Lấy chi tiết một club theo ID
  // API: GET /api/clubs/{id}
  // @param {number} id - ID của club
  // @returns {Promise} - Thông tin chi tiết club (bao gồm activities)
  getById: (id) => {
    return api.get(`/clubs/${id}`);
  },
  // Cập nhật thông tin club
  // API: PUT /api/clubs/{id}
  // Admin và Club Leader có thể update
  update: (id, updateData) => {
    return api.put(`/clubs/${id}`, updateData);
  },
  // Xóa club
  // API: DELETE /api/clubs/{id}
  // Admin và Club Leader có thể delete
  delete: (id) => {
    return api.delete(`/clubs/${id}`);
  },
  updateStatus: (id, isActive) => {
    // TODO: Backend chưa có API này - cần implement
    // Expected: PUT /api/clubs/{id}/status
    return api.put(`/clubs/${id}/status`, { isActive });
  },
  getRevenue: (clubId) => {
    // TODO: Backend chưa có API này - cần implement
    // Expected: GET /api/clubs/{clubId}/revenue
    return api.get(`/clubs/${clubId}/revenue`);
  },
  getAllRevenue: () => {
    // TODO: Backend chưa có API này - cần implement
    // Expected: GET /api/clubs/revenue/total
    return api.get('/clubs/revenue/total');
  },
};


