import api from '../config/client';

// Notification APIs - Quản lý thông báo
export const notificationAPI = {
  // Lấy danh sách thông báo chưa đọc
  // API: GET /api/notification
  // @returns {Promise} - Danh sách notifications chưa đọc
  getUnread: async () => {
    const response = await api.get('/notification');
    return response.data;
  },
  // Đánh dấu thông báo đã đọc
  // API: POST /api/notification/read/{id}
  // @param {string} notificationId - ID của notification
  markAsRead: (notificationId) => {
    return api.post(`/notification/read/${notificationId}`);
  },
};


