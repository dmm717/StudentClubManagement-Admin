import api from '../config/client';

export const notificationAPI = {
  getUnread: async () => {
    const response = await api.get('/notification');
    return response.data;
  },
  markAsRead: (notificationId) => {
    return api.post(`/notification/read/${notificationId}`);
  },
};


