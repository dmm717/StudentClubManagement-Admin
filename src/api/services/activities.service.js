/**
 * Activities API Service
 * 
 * Mục đích:
 * - Quản lý các API liên quan đến hoạt động (activities) của câu lạc bộ
 * - Cung cấp các hàm để lấy danh sách, lọc theo CLB, và xem chi tiết hoạt động
 * 
 * Endpoints sử dụng:
 * - GET /activities: Lấy tất cả hoạt động
 * - GET /activities/club/:clubId: Lấy hoạt động theo câu lạc bộ
 * - GET /activities/:id: Lấy chi tiết một hoạt động
 * 
 * Được sử dụng bởi:
 * - src/pages/admin/Activities.jsx: Quản lý danh sách hoạt động
 * - src/pages/admin/Dashboard.jsx: Thống kê số lượng hoạt động
 * 
 * @module api/services/activities.service
 */
import api from '../config/client';

export const activitiesAPI = {
  /**
   * Lấy danh sách tất cả hoạt động trong hệ thống
   * 
   * Mục đích:
   * - Lấy toàn bộ hoạt động của tất cả câu lạc bộ
   * - Dùng để hiển thị danh sách hoặc thống kê
   * 
   * @returns {Promise<Object>} Promise chứa response từ API
   * @returns {Array} returns.data - Mảng các object hoạt động
   * @returns {Object} returns.data[].id - ID của hoạt động
   * @returns {string} returns.data[].name - Tên hoạt động
   * @returns {string} returns.data[].description - Mô tả hoạt động
   * @returns {number} returns.data[].clubId - ID câu lạc bộ tổ chức
   * @returns {Date} returns.data[].startDate - Ngày bắt đầu
   * @returns {Date} returns.data[].endDate - Ngày kết thúc
   * 
   * @example
   * const response = await activitiesAPI.getAll();
   * console.log(response.data); // Array of activities
   * 
   * Sử dụng tại:
   * - src/pages/admin/Activities.jsx: Hiển thị danh sách hoạt động
   * - src/pages/admin/Dashboard.jsx: Đếm tổng số hoạt động để thống kê
   * 
   * Lưu ý:
   * - Response có thể rất lớn nếu có nhiều hoạt động
   * - Có thể cần phân trang ở phía server trong tương lai
   */
  getAll: () => api.get('/activities'),
  
  /**
   * Lấy danh sách hoạt động của một câu lạc bộ cụ thể
   * 
   * Mục đích:
   * - Lọc hoạt động theo câu lạc bộ
   * - Dùng khi admin muốn xem hoạt động của một CLB nhất định
   * 
   * @param {number} clubId - ID của câu lạc bộ cần lấy hoạt động
   * @returns {Promise<Object>} Promise chứa response từ API
   * @returns {Array} returns.data - Mảng các hoạt động của CLB
   * 
   * @example
   * const activities = await activitiesAPI.getByClub(1);
   * // Trả về tất cả hoạt động của CLB có ID = 1
   * 
   * Sử dụng tại:
   * - src/pages/admin/Activities.jsx: Khi user chọn filter theo CLB
   * 
   * Lưu ý:
   * - Nếu clubId không tồn tại, API sẽ trả về mảng rỗng hoặc lỗi 404
   * - Cần validate clubId trước khi gọi API
   */
  getByClub: (clubId) => api.get(`/activities/club/${clubId}`),
  
  /**
   * Lấy thông tin chi tiết của một hoạt động cụ thể
   * 
   * Mục đích:
   * - Xem đầy đủ thông tin của một hoạt động (mô tả, ngày giờ, địa điểm, v.v.)
   * - Dùng khi user click vào một hoạt động để xem chi tiết
   * 
   * @param {number} id - ID của hoạt động cần lấy thông tin
   * @returns {Promise<Object>} Promise chứa response từ API
   * @returns {Object} returns.data - Object chứa thông tin chi tiết hoạt động
   * @returns {number} returns.data.id - ID hoạt động
   * @returns {string} returns.data.name - Tên hoạt động
   * @returns {string} returns.data.description - Mô tả chi tiết
   * @returns {Object} returns.data.club - Thông tin câu lạc bộ tổ chức
   * @returns {Date} returns.data.startDate - Ngày giờ bắt đầu
   * @returns {Date} returns.data.endDate - Ngày giờ kết thúc
   * @returns {string} returns.data.location - Địa điểm tổ chức
   * 
   * @example
   * const activity = await activitiesAPI.getById(5);
   * console.log(activity.data.name); // Tên hoạt động
   * 
   * Sử dụng tại:
   * - src/pages/admin/Activities.jsx: Khi user click vào một hoạt động để xem modal chi tiết
   * 
   * Lưu ý:
   * - Nếu id không tồn tại, API sẽ trả về lỗi 404
   * - Response chứa đầy đủ thông tin hơn so với getAll()
   */
  getById: (id) => api.get(`/activities/${id}`),
};

