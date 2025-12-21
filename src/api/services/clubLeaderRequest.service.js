/**
 * Club Leader Request API Service
 * 
 * Được sử dụng bởi:
 * - src/pages/admin/Requests.jsx (getPending, getApproved, getRejected, getStats, approve, reject)
 * - src/pages/admin/Dashboard.jsx (getStats)
 * - src/components/layout/AdminLayout.jsx (getPending)
 */
import api from '../config/client';

export const clubLeaderRequestAPI = {
  /**
   * Lấy danh sách yêu cầu đang chờ duyệt
   * @returns {Promise} Response từ API
   * 
   * Sử dụng tại:
   * - src/pages/admin/Requests.jsx
   * - src/components/layout/AdminLayout.jsx (đếm số lượng pending)
   */
  getPending: () => api.get('/club-leader-requests'),
  
  /**
   * Lấy thống kê về yêu cầu làm leader
   * @returns {Promise} Response từ API
   * 
   * Sử dụng tại:
   * - src/pages/admin/Requests.jsx
   * - src/pages/admin/Dashboard.jsx
   */
  getStats: () => api.get('/admin/accounts/leader-requests/stats'),
  
  /**
   * Lấy danh sách yêu cầu đã được duyệt
   * @returns {Promise} Response từ API
   * 
   * Sử dụng tại: src/pages/admin/Requests.jsx
   */
  getApproved: () => api.get('/admin/accounts/leader-requests/approved'),
  
  /**
   * Lấy danh sách yêu cầu đã bị từ chối
   * @returns {Promise} Response từ API
   * 
   * Sử dụng tại: src/pages/admin/Requests.jsx
   */
  getRejected: () => api.get('/admin/accounts/leader-requests/rejected'),
  
  /**
   * Duyệt yêu cầu làm leader
   * @param {number} id - ID của yêu cầu
   * @param {string} adminNote - Ghi chú của admin
   * @returns {Promise} Response từ API
   * 
   * Sử dụng tại: src/pages/admin/Requests.jsx
   */
  approve: (id, adminNote) => 
    api.put(`/club-leader-requests/${id}/approve`, { adminNote }),
  
  /**
   * Từ chối yêu cầu làm leader
   * @param {number} id - ID của yêu cầu
   * @param {string} rejectReason - Lý do từ chối
   * @returns {Promise} Response từ API
   * 
   * Sử dụng tại: src/pages/admin/Requests.jsx
   */
  reject: (id, rejectReason) => 
    api.put(`/club-leader-requests/${id}/reject`, { rejectReason }),
};

