import api from '../config/client';

// Leader Clubs APIs (for club leader role, but may be used by admin)
export const leaderClubsAPI = {
  // Backend: GET /api/leader/clubs (club leader only)
  getAll: () => {
    return api.get('/leader/clubs');
  },
  // Backend: GET /api/leader/clubs/{clubId}
  getById: (clubId) => {
    return api.get(`/leader/clubs/${clubId}`);
  },
  // Backend: GET /api/leader/clubs/{clubId}/membership-requests?status=pending
  getMembershipRequests: (clubId, status = 'pending') => {
    return api.get(`/leader/clubs/${clubId}/membership-requests`, {
      params: { status },
    });
  },
  // Backend: POST /api/leader/clubs/{clubId}/membership-requests/{requestId}/approve
  approveMembershipRequest: (clubId, requestId) => {
    return api.post(`/leader/clubs/${clubId}/membership-requests/${requestId}/approve`);
  },
  // Backend: POST /api/leader/clubs/{clubId}/membership-requests/{requestId}/reject
  rejectMembershipRequest: (clubId, requestId, reason) => {
    return api.post(
      `/leader/clubs/${clubId}/membership-requests/${requestId}/reject`,
      { reason }
    );
  },
  // Backend: GET /api/leader/clubs/{clubId}/members
  getMembers: (clubId) => {
    return api.get(`/leader/clubs/${clubId}/members`);
  },
};


