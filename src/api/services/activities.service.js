import api from '../config/client';

// Activities APIs - Quản lý hoạt động của các câu lạc bộ
export const activitiesAPI = {
  // Lấy danh sách tất cả activities
  // API: GET /api/activities
  // @returns {Promise} - Danh sách activities
  getAll: () => {
    return api.get('/activities');
  },
  // Lấy danh sách activities của một club cụ thể
  // API: GET /api/activities/club/{clubId}
  getByClub: (clubId) => {
    return api.get(`/activities/club/${clubId}`);
  },
  // Lấy chi tiết một activity
  // API: GET /api/activities/{id}
  getById: (id) => {
    return api.get(`/activities/${id}`);
  },
  // Cập nhật thông tin activity
  // API: PUT /api/activities/{id}
  // Admin và Club Leader có thể update
  update: (id, updateData) => {
    return api.put(`/activities/${id}`, updateData);
  },
  // Xóa activity
  // API: DELETE /api/activities/{id}
  // Admin và Club Leader có thể delete
  delete: (id) => {
    return api.delete(`/activities/${id}`);
  },
};


