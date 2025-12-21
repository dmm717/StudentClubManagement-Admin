/**
 * Club Leader Request API Service
 * 
 * Mục đích:
 * - Quản lý các API liên quan đến yêu cầu làm leader của câu lạc bộ
 * - Xử lý quy trình duyệt/từ chối yêu cầu làm leader từ student
 * - Cung cấp thống kê về các yêu cầu
 * 
 * Endpoints sử dụng:
 * - GET /club-leader-requests: Lấy yêu cầu đang chờ duyệt
 * - GET /admin/accounts/leader-requests/stats: Lấy thống kê
 * - GET /admin/accounts/leader-requests/approved: Lấy yêu cầu đã duyệt
 * - GET /admin/accounts/leader-requests/rejected: Lấy yêu cầu đã từ chối
 * - PUT /club-leader-requests/:id/approve: Duyệt yêu cầu
 * - PUT /club-leader-requests/:id/reject: Từ chối yêu cầu
 * 
 * Được sử dụng bởi:
 * - src/pages/admin/Requests.jsx: Quản lý yêu cầu (tất cả các hàm)
 * - src/pages/admin/Dashboard.jsx: Hiển thị thống kê (getStats)
 * - src/components/layout/AdminLayout.jsx: Hiển thị số lượng pending (getPending)
 * 
 * Quy trình:
 * 1. Student gửi yêu cầu làm leader → status: pending
 * 2. Admin xem danh sách pending → getPending()
 * 3. Admin duyệt/từ chối → approve() hoặc reject()
 * 4. Yêu cầu chuyển sang approved hoặc rejected
 * 
 * @module api/services/clubLeaderRequest.service
 */
import api from '../config/client';

export const clubLeaderRequestAPI = {
  /**
   * Lấy danh sách yêu cầu làm leader đang chờ duyệt (pending)
   * 
   * Mục đích:
   * - Hiển thị các yêu cầu cần được admin xử lý
   * - Dùng để đếm số lượng yêu cầu chờ duyệt (badge notification)
   * 
   * @returns {Promise<Object>} Promise chứa response từ API
   * @returns {Array} returns.data - Mảng các yêu cầu đang chờ duyệt
   * @returns {number} returns.data[].id - ID của yêu cầu
   * @returns {number} returns.data[].accountId - ID của account gửi yêu cầu
   * @returns {number} returns.data[].clubId - ID của câu lạc bộ
   * @returns {string} returns.data[].status - Luôn là 'pending'
   * @returns {string} returns.data[].reason - Lý do xin làm leader
   * @returns {Date} returns.data[].createdAt - Ngày gửi yêu cầu
   * 
   * @example
   * const response = await clubLeaderRequestAPI.getPending();
   * const pendingCount = response.data.length;
   * 
   * Sử dụng tại:
   * - src/pages/admin/Requests.jsx: Hiển thị tab "Chờ duyệt"
   * - src/components/layout/AdminLayout.jsx: Đếm số lượng để hiển thị badge
   * 
   * Lưu ý:
   * - Chỉ trả về các yêu cầu có status = 'pending'
   * - Admin cần xử lý các yêu cầu này bằng approve() hoặc reject()
   */
  getPending: () => api.get('/club-leader-requests'),
  
  /**
   * Lấy thống kê về các yêu cầu làm leader
   * 
   * Mục đích:
   * - Cung cấp số liệu tổng quan về yêu cầu (pending, approved, rejected)
   * - Dùng để hiển thị trên dashboard
   * 
   * @returns {Promise<Object>} Promise chứa response từ API
   * @returns {Object} returns.data - Object chứa thống kê
   * @returns {number} returns.data.pending - Số lượng yêu cầu đang chờ
   * @returns {number} returns.data.approved - Số lượng yêu cầu đã duyệt
   * @returns {number} returns.data.rejected - Số lượng yêu cầu đã từ chối
   * @returns {number} returns.data.total - Tổng số yêu cầu
   * 
   * @example
   * const stats = await clubLeaderRequestAPI.getStats();
   * console.log(`Pending: ${stats.data.pending}`);
   * 
   * Sử dụng tại:
   * - src/pages/admin/Requests.jsx: Hiển thị thống kê ở đầu trang
   * - src/pages/admin/Dashboard.jsx: Hiển thị trong phần thống kê tổng quan
   * 
   * Lưu ý:
   * - Dữ liệu được tính real-time từ database
   * - Có thể cache để tối ưu performance nếu cần
   */
  getStats: () => api.get('/admin/accounts/leader-requests/stats'),
  
  /**
   * Lấy danh sách yêu cầu làm leader đã được duyệt (approved)
   * 
   * Mục đích:
   * - Xem lịch sử các yêu cầu đã được admin duyệt
   * - Dùng để tra cứu và quản lý
   * 
   * @returns {Promise<Object>} Promise chứa response từ API
   * @returns {Array} returns.data - Mảng các yêu cầu đã được duyệt
   * @returns {string} returns.data[].status - Luôn là 'approved'
   * @returns {string} returns.data[].adminNote - Ghi chú của admin khi duyệt
   * @returns {Date} returns.data[].approvedAt - Ngày duyệt
   * 
   * @example
   * const approved = await clubLeaderRequestAPI.getApproved();
   * // Hiển thị danh sách các yêu cầu đã được duyệt
   * 
   * Sử dụng tại:
   * - src/pages/admin/Requests.jsx: Hiển thị tab "Đã duyệt"
   * 
   * Lưu ý:
   * - Chỉ trả về các yêu cầu có status = 'approved'
   * - User đã được gán role ClubLeader sau khi yêu cầu được duyệt
   */
  getApproved: () => api.get('/admin/accounts/leader-requests/approved'),
  
  /**
   * Lấy danh sách yêu cầu làm leader đã bị từ chối (rejected)
   * 
   * Mục đích:
   * - Xem lịch sử các yêu cầu đã bị admin từ chối
   * - Dùng để tra cứu và quản lý
   * 
   * @returns {Promise<Object>} Promise chứa response từ API
   * @returns {Array} returns.data - Mảng các yêu cầu đã bị từ chối
   * @returns {string} returns.data[].status - Luôn là 'rejected'
   * @returns {string} returns.data[].rejectReason - Lý do từ chối
   * @returns {Date} returns.data[].rejectedAt - Ngày từ chối
   * 
   * @example
   * const rejected = await clubLeaderRequestAPI.getRejected();
   * // Hiển thị danh sách các yêu cầu đã bị từ chối
   * 
   * Sử dụng tại:
   * - src/pages/admin/Requests.jsx: Hiển thị tab "Đã từ chối"
   * 
   * Lưu ý:
   * - Chỉ trả về các yêu cầu có status = 'rejected'
   * - User có thể gửi lại yêu cầu mới sau khi bị từ chối
   */
  getRejected: () => api.get('/admin/accounts/leader-requests/rejected'),
  
  /**
   * Duyệt yêu cầu làm leader
   * 
   * Mục đích:
   * - Chấp nhận yêu cầu của student để làm leader của câu lạc bộ
   * - Tự động gán role ClubLeader cho user
   * - Chuyển status của yêu cầu từ 'pending' → 'approved'
   * 
   * @param {number} id - ID của yêu cầu cần duyệt
   * @param {string} adminNote - Ghi chú của admin khi duyệt (optional)
   * @returns {Promise<Object>} Promise chứa response từ API
   * @returns {Object} returns.data - Thông tin yêu cầu sau khi duyệt
   * @returns {string} returns.data.status - Sẽ là 'approved'
   * 
   * @example
   * await clubLeaderRequestAPI.approve(10, 'Đã kiểm tra và xác nhận đủ điều kiện');
   * // Yêu cầu ID = 10 được duyệt, user được gán role ClubLeader
   * 
   * Sử dụng tại:
   * - src/pages/admin/Requests.jsx: Khi admin click nút "Duyệt" trên một yêu cầu
   * 
   * Lưu ý:
   * - Sau khi duyệt, user sẽ có quyền quản lý câu lạc bộ
   * - Cần xác nhận trước khi duyệt (confirm dialog)
   * - adminNote có thể để trống hoặc null
   * - Yêu cầu sẽ không thể duyệt lại nếu đã được xử lý
   */
  approve: (id, adminNote) => 
    api.put(`/club-leader-requests/${id}/approve`, { adminNote }),
  
  /**
   * Từ chối yêu cầu làm leader
   * 
   * Mục đích:
   * - Từ chối yêu cầu của student làm leader
   * - Chuyển status của yêu cầu từ 'pending' → 'rejected'
   * - User không được gán role ClubLeader
   * 
   * @param {number} id - ID của yêu cầu cần từ chối
   * @param {string} rejectReason - Lý do từ chối (bắt buộc)
   * @returns {Promise<Object>} Promise chứa response từ API
   * @returns {Object} returns.data - Thông tin yêu cầu sau khi từ chối
   * @returns {string} returns.data.status - Sẽ là 'rejected'
   * @returns {string} returns.data.rejectReason - Lý do từ chối
   * 
   * @example
   * await clubLeaderRequestAPI.reject(10, 'Chưa đủ điều kiện làm leader');
   * // Yêu cầu ID = 10 bị từ chối, user không được gán role ClubLeader
   * 
   * Sử dụng tại:
   * - src/pages/admin/Requests.jsx: Khi admin click nút "Từ chối" trên một yêu cầu
   * 
   * Lưu ý:
   * - rejectReason là bắt buộc, cần nhập lý do rõ ràng
   * - Lý do từ chối sẽ được lưu và hiển thị cho user
   * - Cần xác nhận trước khi từ chối (confirm dialog)
   * - User có thể gửi lại yêu cầu mới sau khi bị từ chối
   * - Yêu cầu sẽ không thể từ chối lại nếu đã được xử lý
   */
  reject: (id, rejectReason) => 
    api.put(`/club-leader-requests/${id}/reject`, { rejectReason }),
};

