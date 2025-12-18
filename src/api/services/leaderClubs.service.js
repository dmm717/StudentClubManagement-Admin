import api from '../config/client';

export const leaderClubsAPI = {
  getAll: () => {
    return api.get('/leader/clubs');
  },
  getById: (clubId) => {
    return api.get(`/leader/clubs/${clubId}`);
  },
  getMembershipRequests: (clubId, status = 'pending') => {
    return api.get(`/leader/clubs/${clubId}/membership-requests`, {
      params: { status },
    });
  },
  approveMembershipRequest: (clubId, requestId) => {
    return api.post(`/leader/clubs/${clubId}/membership-requests/${requestId}/approve`);
  },
  rejectMembershipRequest: (clubId, requestId, reason) => {
    return api.post(
      `/leader/clubs/${clubId}/membership-requests/${requestId}/reject`,
      { reason }
    );
  },
  getMembers: (clubId) => {
    return api.get(`/leader/clubs/${clubId}/members`);
  },
};


