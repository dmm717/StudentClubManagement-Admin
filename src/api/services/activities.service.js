import api from '../config/client';

export const activitiesAPI = {
  getAll: () => {
    return api.get('/activities');
  },
  getByClub: (clubId) => {
    return api.get(`/activities/club/${clubId}`);
  },
  getById: (id) => {
    return api.get(`/activities/${id}`);
  },
  update: (id, updateData) => {
    return api.put(`/activities/${id}`, updateData);
  },
  delete: (id) => {
    return api.delete(`/activities/${id}`);
  },
};


