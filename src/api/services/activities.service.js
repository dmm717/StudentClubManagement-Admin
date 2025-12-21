/**
 * Activities API Service
 * 
 * Được sử dụng bởi:
 * - src/pages/admin/Activities.jsx (getAll, getByClub, getById)
 * - src/pages/admin/Reports.jsx (getAll)
 * - src/pages/admin/Dashboard.jsx (getAll - để thống kê)
 */
import api from '../config/client';

export const activitiesAPI = {
  /**
   * Lấy danh sách tất cả hoạt động
   * @returns {Promise} Response từ API
   * 
   * Sử dụng tại:
   * - src/pages/admin/Activities.jsx
   * - src/pages/admin/Reports.jsx
   * - src/pages/admin/Dashboard.jsx (để thống kê)
   */
  getAll: () => api.get('/activities'),
  
  /**
   * Lấy danh sách hoạt động theo câu lạc bộ
   * @param {number} clubId - ID của câu lạc bộ
   * @returns {Promise} Response từ API
   * 
   * Sử dụng tại: src/pages/admin/Activities.jsx (khi filter theo CLB)
   */
  getByClub: (clubId) => api.get(`/activities/club/${clubId}`),
  
  /**
   * Lấy thông tin chi tiết của một hoạt động
   * @param {number} id - ID của hoạt động
   * @returns {Promise} Response từ API
   * 
   * Sử dụng tại: src/pages/admin/Activities.jsx (khi xem chi tiết)
   */
  getById: (id) => api.get(`/activities/${id}`),
};

