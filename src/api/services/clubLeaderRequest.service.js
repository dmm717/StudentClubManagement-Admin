import api from '../config/client';

export const clubLeaderRequestAPI = {
  getPending: () => {
    return api.get('/club-leader-requests');
  },
  getStats: () => {
    return api.get('/admin/accounts/leader-requests/stats');
  },
  getApproved: () => {
    return api.get('/admin/accounts/leader-requests/approved');
  },
  getRejected: () => {
    return api.get('/admin/accounts/leader-requests/rejected');
  },
  approve: (id, adminNote) => {
    return api.put(`/club-leader-requests/${id}/approve`, { adminNote });
  },
  reject: (id, rejectReason) => {
    return api.put(`/club-leader-requests/${id}/reject`, { rejectReason });
  },
};


