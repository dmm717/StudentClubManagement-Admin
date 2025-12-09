import axios from 'axios';
import { showError } from '../utils/notifications';

/**
 * File api.js - Quản lý tất cả API calls
 * Sử dụng axios để gọi API với interceptors xử lý authentication và errors
 */

// Base API URL - sử dụng proxy trong development
const API_BASE_URL = '/api';

// Tạo axios instance với cấu hình mặc định
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor - Tự động thêm JWT token vào header
 * Mỗi request sẽ tự động có Authorization header nếu có token trong localStorage
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor - Xử lý errors tự động
 * - 401 (Unauthorized): Xóa token và redirect về login
 * - 403 (Forbidden): Hiển thị thông báo không có quyền
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Xử lý các mã lỗi cụ thể
      if (error.response.status === 401) {
        // Unauthorized - xóa token và redirect về login
        localStorage.removeItem('token');
        localStorage.removeItem('adminUser');
        window.location.href = '/admin/login';
      } else if (error.response.status === 403) {
        showError('Bạn không có quyền thực hiện hành động này!', 'Không có quyền');
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Auth APIs - Xác thực người dùng
 */
export const authAPI = {
  /**
   * Đăng nhập
   * API: POST /api/auth/login
   * @param {string} username - Tên đăng nhập
   * @param {string} password - Mật khẩu
   * @returns {Promise} - Response chứa token và thông tin user
   */
  login: (username, password) => {
    return api.post('/auth/login', { username, password });
  },
};

/**
 * Club Leader Request APIs - Quản lý yêu cầu trở thành Club Leader
 */
export const clubLeaderRequestAPI = {
  /**
   * Lấy danh sách yêu cầu chờ duyệt (admin only)
   * API: GET /api/club-leader-requests
   * @returns {Promise} - Danh sách các yêu cầu pending
   */
  getPending: () => {
    return api.get('/club-leader-requests');
  },
  /**
   * Duyệt yêu cầu trở thành Club Leader
   * API: PUT /api/club-leader-requests/{id}/approve
   * Khi duyệt, hệ thống tự động tạo tài khoản Club Leader cho user
   * @param {number} id - ID của yêu cầu
   * @returns {Promise}
   */
  approve: (id) => {
    return api.put(`/club-leader-requests/${id}/approve`);
  },
  /**
   * Từ chối yêu cầu trở thành Club Leader
   * API: PUT /api/club-leader-requests/{id}/reject
   * @param {number} id - ID của yêu cầu
   * @param {string} rejectReason - Lý do từ chối (optional)
   * @returns {Promise}
   */
  reject: (id, rejectReason) => {
    return api.put(`/club-leader-requests/${id}/reject`, { rejectReason });
  },
};

/**
 * Clubs APIs - Quản lý câu lạc bộ
 */
export const clubsAPI = {
  /**
   * Lấy danh sách tất cả clubs
   * API: GET /api/clubs
   * @returns {Promise} - Danh sách clubs
   */
  getAll: () => {
    return api.get('/clubs');
  },
  /**
   * Lấy chi tiết một club theo ID
   * API: GET /api/clubs/{id}
   * @param {number} id - ID của club
   * @returns {Promise} - Thông tin chi tiết club (bao gồm activities)
   */
  getById: (id) => {
    return api.get(`/clubs/${id}`);
  },
  /**
   * Cập nhật thông tin club
   * API: PUT /api/clubs/{id}
   * Admin và Club Leader có thể update
   * @param {number} id - ID của club
   * @param {object} updateData - Dữ liệu cập nhật (name, description, status, etc.)
   * @returns {Promise}
   */
  update: (id, updateData) => {
    return api.put(`/clubs/${id}`, updateData);
  },
  /**
   * Xóa club
   * API: DELETE /api/clubs/{id}
   * Admin và Club Leader có thể delete
   * @param {number} id - ID của club
   * @returns {Promise}
   */
  delete: (id) => {
    return api.delete(`/clubs/${id}`);
  },
  updateStatus: (id, isActive) => {
    // TODO: Backend chưa có API này - cần implement
    // Expected: PUT /api/clubs/{id}/status
    return api.put(`/clubs/${id}/status`, { isActive });
  },
  getRevenue: (clubId) => {
    // TODO: Backend chưa có API này - cần implement
    // Expected: GET /api/clubs/{clubId}/revenue
    return api.get(`/clubs/${clubId}/revenue`);
  },
  getAllRevenue: () => {
    // TODO: Backend chưa có API này - cần implement
    // Expected: GET /api/clubs/revenue/total
    return api.get('/clubs/revenue/total');
  },
};

/**
 * Account APIs (Admin) - Quản lý tài khoản (chỉ admin)
 */
export const accountsAPI = {
  /**
   * Lấy danh sách tất cả tài khoản
   * API: GET /api/admin/accounts
   * @returns {Promise} - Danh sách accounts
   */
  getAll: () => {
    return api.get('/admin/accounts');
  },
  /**
   * Lấy thông tin chi tiết một tài khoản
   * API: GET /api/admin/accounts/{id}
   * @param {number} id - ID của account
   * @returns {Promise} - Thông tin chi tiết account
   */
  getById: (id) => {
    return api.get(`/admin/accounts/${id}`);
  },
  /**
   * Khóa tài khoản
   * API: PUT /api/admin/accounts/{id}/lock
   * @param {number} id - ID của account
   * @returns {Promise}
   */
  lock: (id) => {
    return api.put(`/admin/accounts/${id}/lock`);
  },
  /**
   * Kích hoạt tài khoản
   * API: PUT /api/admin/accounts/{id}/activate
   * @param {number} id - ID của account
   * @returns {Promise}
   */
  activate: (id) => {
    return api.put(`/admin/accounts/${id}/activate`);
  },
  /**
   * Reset mật khẩu tài khoản
   * API: PUT /api/admin/accounts/{id}/reset-password
   * @param {number} id - ID của account
   * @param {string} newPassword - Mật khẩu mới
   * @returns {Promise}
   */
  resetPassword: (id, newPassword) => {
    return api.put(`/admin/accounts/${id}/reset-password`, { newPassword });
  },
  /**
   * Thêm vai trò cho tài khoản
   * API: POST /api/admin/accounts/{id}/roles
   * @param {number} id - ID của account
   * @param {object} roleData - Dữ liệu vai trò { roleName: 'admin' | 'clubleader' | 'student' }
   * @returns {Promise}
   */
  addRole: (id, roleData) => {
    return api.post(`/admin/accounts/${id}/roles`, roleData);
  },
  /**
   * Xóa vai trò khỏi tài khoản
   * API: DELETE /api/admin/accounts/{id}/roles
   * @param {number} id - ID của account
   * @param {object} roleData - Dữ liệu vai trò { roleName: 'admin' | 'clubleader' | 'student' }
   * @returns {Promise}
   */
  removeRole: (id, roleData) => {
    return api.delete(`/admin/accounts/${id}/roles`, { data: roleData });
  },
};

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
      params: { status }
    });
  },
  // Backend: POST /api/leader/clubs/{clubId}/membership-requests/{requestId}/approve
  approveMembershipRequest: (clubId, requestId) => {
    return api.post(`/leader/clubs/${clubId}/membership-requests/${requestId}/approve`);
  },
  // Backend: POST /api/leader/clubs/{clubId}/membership-requests/{requestId}/reject
  rejectMembershipRequest: (clubId, requestId, reason) => {
    return api.post(`/leader/clubs/${clubId}/membership-requests/${requestId}/reject`, { reason });
  },
  // Backend: GET /api/leader/clubs/{clubId}/members
  getMembers: (clubId) => {
    return api.get(`/leader/clubs/${clubId}/members`);
  },
};

/**
 * Activities APIs - Quản lý hoạt động của các câu lạc bộ
 */
export const activitiesAPI = {
  /**
   * Lấy danh sách tất cả activities
   * API: GET /api/activities
   * @returns {Promise} - Danh sách activities
   */
  getAll: () => {
    return api.get('/activities');
  },
  /**
   * Lấy danh sách activities của một club cụ thể
   * API: GET /api/activities/club/{clubId}
   * @param {number} clubId - ID của club
   * @returns {Promise} - Danh sách activities của club
   */
  getByClub: (clubId) => {
    return api.get(`/activities/club/${clubId}`);
  },
  /**
   * Lấy chi tiết một activity
   * API: GET /api/activities/{id}
   * @param {number} id - ID của activity
   * @returns {Promise} - Thông tin chi tiết activity
   */
  getById: (id) => {
    return api.get(`/activities/${id}`);
  },
  /**
   * Cập nhật thông tin activity
   * API: PUT /api/activities/{id}
   * Admin và Club Leader có thể update
   * @param {number} id - ID của activity
   * @param {object} updateData - Dữ liệu cập nhật (title, description, status, startTime, endTime, location)
   * @returns {Promise}
   */
  update: (id, updateData) => {
    return api.put(`/activities/${id}`, updateData);
  },
  /**
   * Xóa activity
   * API: DELETE /api/activities/{id}
   * Admin và Club Leader có thể delete
   * @param {number} id - ID của activity
   * @returns {Promise}
   */
  delete: (id) => {
    return api.delete(`/activities/${id}`);
  },
};

export default api;
