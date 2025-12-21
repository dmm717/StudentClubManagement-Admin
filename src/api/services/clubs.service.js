/**
 * Clubs API Service
 * 
 * Được sử dụng bởi:
 * - src/pages/admin/Clubs.jsx (getAll, getById, update)
 * - src/pages/admin/Activities.jsx (getAll - để lấy danh sách CLB cho filter)
 * - src/pages/admin/Dashboard.jsx (getAll - để thống kê)
 */
import api from '../config/client';

export const clubsAPI = {
  /**
   * Lấy danh sách tất cả câu lạc bộ
   * @returns {Promise} Response từ API
   * 
   * Sử dụng tại:
   * - src/pages/admin/Clubs.jsx
   * - src/pages/admin/Activities.jsx (để filter theo CLB)
   * - src/pages/admin/Dashboard.jsx (để thống kê)
   */
  getAll: () => api.get('/clubs'),
  
  /**
   * Lấy thông tin chi tiết của một câu lạc bộ
   * @param {number} id - ID của câu lạc bộ
   * @returns {Promise} Response từ API
   * 
   * Sử dụng tại: src/pages/admin/Clubs.jsx
   */
  getById: (id) => api.get(`/clubs/${id}`),
  
  /**
   * Cập nhật thông tin câu lạc bộ
   * @param {number} id - ID của câu lạc bộ
   * @param {Object} updateData - Dữ liệu cập nhật
   * @returns {Promise} Response từ API
   * 
   * Sử dụng tại: src/pages/admin/Clubs.jsx (để cập nhật status khi khóa/mở khóa)
   */
  update: (id, updateData) => api.put(`/clubs/${id}`, updateData),
};

