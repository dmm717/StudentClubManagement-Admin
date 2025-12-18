import api from '../config/client';

export const clubsAPI = {
  getAll: () => {
    return api.get('/clubs');
  },
  getById: (id) => {
    return api.get(`/clubs/${id}`);
  },
  update: (id, updateData) => {
    return api.put(`/clubs/${id}`, updateData);
  },
  delete: (id) => {
    return api.delete(`/clubs/${id}`);
  },
  updateStatus: (id, isActive) => {
    return api.put(`/clubs/${id}/status`, { isActive });
  },
  getRevenue: (clubId) => {
    return api.get(`/clubs/${clubId}/revenue`);
  },
  getAllRevenue: () => {
    return api.get('/clubs/revenue/total');
  },
};


