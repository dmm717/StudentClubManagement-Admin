import api from '../config/client';

export const accountsAPI = {
  getAll: () => {
    return api.get('/admin/accounts');
  },
  getById: (id) => {
    return api.get(`/admin/accounts/${id}`);
  },
  lock: (id) => {
    return api.put(`/admin/accounts/${id}/lock`);
  },
  activate: (id) => {
    return api.put(`/admin/accounts/${id}/activate`);
  },
  resetPassword: (id, newPassword) => {
    return api.put(`/admin/accounts/${id}/reset-password`, { newPassword });
  },
  addRole: (id, roleData) => {
    return api.post(`/admin/accounts/${id}/roles`, roleData);
  },
  removeRole: (id, roleData) => {
    return api.delete(`/admin/accounts/${id}/roles`, { data: roleData });
  },
};


