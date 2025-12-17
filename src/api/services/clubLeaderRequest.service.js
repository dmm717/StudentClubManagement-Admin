import api from '../config/client';

// Club Leader Request APIs - Quản lý yêu cầu trở thành Club Leader
export const clubLeaderRequestAPI = {
  // Lấy danh sách yêu cầu chờ duyệt (admin only)
  // API: GET /api/club-leader-requests
  // @returns {Promise} - Danh sách các yêu cầu pending
  getPending: () => {
    return api.get('/club-leader-requests');
  },
  // Lấy thống kê yêu cầu leader
  // API: GET /api/admin/accounts/leader-requests/stats
  // @returns {Promise} - Thống kê { totalApproved, totalRejected, totalPending, total }
  getStats: () => {
    return api.get('/admin/accounts/leader-requests/stats');
  },
  // Lấy danh sách yêu cầu đã duyệt (admin only)
  // API: GET /api/admin/accounts/leader-requests/approved
  // @returns {Promise} - Danh sách các yêu cầu đã duyệt
  getApproved: () => {
    return api.get('/admin/accounts/leader-requests/approved');
  },
  // Lấy danh sách yêu cầu đã từ chối (admin only)
  // API: GET /api/admin/accounts/leader-requests/rejected
  // @returns {Promise} - Danh sách các yêu cầu đã từ chối
  getRejected: () => {
    return api.get('/admin/accounts/leader-requests/rejected');
  },
  // Duyệt yêu cầu trở thành Club Leader
  // API: PUT /api/club-leader-requests/{id}/approve
  // Khi duyệt, hệ thống tự động tạo tài khoản Club Leader cho user
  approve: (id, adminNote) => {
    return api.put(`/club-leader-requests/${id}/approve`, { adminNote });
  },
  // Từ chối yêu cầu trở thành Club Leader
  // API: PUT /api/club-leader-requests/{id}/reject
  reject: (id, rejectReason) => {
    return api.put(`/club-leader-requests/${id}/reject`, { rejectReason });
  },
};


