/**
 * Clubs API Service
 * 
 * Mục đích:
 * - Quản lý các API liên quan đến câu lạc bộ (clubs)
 * - Cung cấp các hàm để lấy danh sách, xem chi tiết, và cập nhật thông tin CLB
 * 
 * Endpoints sử dụng:
 * - GET /clubs: Lấy danh sách tất cả câu lạc bộ
 * - GET /clubs/:id: Lấy chi tiết một câu lạc bộ
 * - PUT /clubs/:id: Cập nhật thông tin câu lạc bộ
 * 
 * Được sử dụng bởi:
 * - src/pages/admin/Clubs.jsx: Quản lý câu lạc bộ (tất cả các hàm)
 * - src/pages/admin/Activities.jsx: Lấy danh sách CLB để filter (getAll)
 * - src/pages/admin/Dashboard.jsx: Thống kê số lượng CLB (getAll)
 * 
 * @module api/services/clubs.service
 */
import api from '../config/client';

export const clubsAPI = {
  /**
   * Lấy danh sách tất cả câu lạc bộ trong hệ thống
   * 
   * Mục đích:
   * - Hiển thị danh sách tất cả câu lạc bộ
   * - Dùng để filter, thống kê, hoặc hiển thị dropdown
   * 
   * @returns {Promise<Object>} Promise chứa response từ API
   * @returns {Array} returns.data - Mảng các object câu lạc bộ
   * @returns {number} returns.data[].id - ID của câu lạc bộ
   * @returns {string} returns.data[].name - Tên câu lạc bộ
   * @returns {string} returns.data[].description - Mô tả câu lạc bộ
   * @returns {string} returns.data[].status - Trạng thái (active, inactive, locked)
   * @returns {number} returns.data[].memberCount - Số lượng thành viên
   * @returns {Object} returns.data[].leader - Thông tin leader của CLB
   * 
   * @example
   * const response = await clubsAPI.getAll();
   * const clubs = response.data;
   * 
   * Sử dụng tại:
   * - src/pages/admin/Clubs.jsx: Hiển thị bảng danh sách câu lạc bộ
   * - src/pages/admin/Activities.jsx: Lấy danh sách CLB để hiển thị trong dropdown filter
   * - src/pages/admin/Dashboard.jsx: Đếm tổng số CLB để thống kê
   * 
   * Lưu ý:
   * - Response có thể rất lớn nếu có nhiều câu lạc bộ
   * - Có thể cần phân trang ở phía server trong tương lai
   * - Dữ liệu được sắp xếp theo thứ tự nào đó (có thể là alphabet hoặc created date)
   */
  getAll: () => api.get('/clubs'),
  
  /**
   * Lấy thông tin chi tiết của một câu lạc bộ cụ thể
   * 
   * Mục đích:
   * - Xem đầy đủ thông tin của một CLB (mô tả, thành viên, hoạt động, v.v.)
   * - Dùng khi cần hiển thị modal chi tiết hoặc form chỉnh sửa
   * 
   * @param {number} id - ID của câu lạc bộ cần lấy thông tin
   * @returns {Promise<Object>} Promise chứa response từ API
   * @returns {Object} returns.data - Object chứa thông tin chi tiết câu lạc bộ
   * @returns {number} returns.data.id - ID câu lạc bộ
   * @returns {string} returns.data.name - Tên câu lạc bộ
   * @returns {string} returns.data.description - Mô tả chi tiết
   * @returns {string} returns.data.status - Trạng thái (active, inactive, locked)
   * @returns {Array} returns.data.members - Danh sách thành viên
   * @returns {Object} returns.data.leader - Thông tin leader
   * @returns {Array} returns.data.activities - Danh sách hoạt động
   * @returns {Date} returns.data.createdAt - Ngày thành lập
   * 
   * @example
   * const club = await clubsAPI.getById(1);
   * console.log(club.data.name); // Tên câu lạc bộ
   * 
   * Sử dụng tại:
   * - src/pages/admin/Clubs.jsx: Khi click vào một CLB để xem modal chi tiết
   * 
   * Lưu ý:
   * - Nếu id không tồn tại, API sẽ trả về lỗi 404
   * - Response chứa đầy đủ thông tin hơn so với getAll() (bao gồm members, activities)
   * - Có thể tốn thời gian load nếu CLB có nhiều thành viên và hoạt động
   */
  getById: (id) => api.get(`/clubs/${id}`),
  
  /**
   * Cập nhật thông tin câu lạc bộ
   * 
   * Mục đích:
   * - Chỉnh sửa thông tin của CLB (tên, mô tả, status, v.v.)
   * - Dùng để khóa/mở khóa CLB, cập nhật thông tin
   * 
   * @param {number} id - ID của câu lạc bộ cần cập nhật
   * @param {Object} updateData - Dữ liệu cập nhật
   * @param {string} [updateData.name] - Tên mới của CLB (optional)
   * @param {string} [updateData.description] - Mô tả mới (optional)
   * @param {string} [updateData.status] - Trạng thái mới: 'active', 'inactive', 'locked' (optional)
   * @returns {Promise<Object>} Promise chứa response từ API
   * @returns {Object} returns.data - Thông tin CLB sau khi cập nhật
   * 
   * @example
   * // Khóa câu lạc bộ
   * await clubsAPI.update(1, { status: 'locked' });
   * 
   * // Cập nhật tên và mô tả
   * await clubsAPI.update(1, { 
   *   name: 'Tên mới', 
   *   description: 'Mô tả mới' 
   * });
   * 
   * Sử dụng tại:
   * - src/pages/admin/Clubs.jsx: 
   *   + Khi admin click nút "Khóa CLB" → update với status: 'locked'
   *   + Khi admin click nút "Mở khóa CLB" → update với status: 'active'
   *   + Khi admin chỉnh sửa thông tin CLB trong form
   * 
   * Lưu ý:
   * - Chỉ cần truyền các field cần cập nhật (partial update)
   * - Status 'locked' sẽ ngăn CLB hoạt động (không thể tạo hoạt động, nhận thành viên mới)
   * - Cần xác nhận trước khi khóa CLB (confirm dialog)
   * - Chỉ admin mới có quyền cập nhật CLB
   */
  update: (id, updateData) => api.put(`/clubs/${id}`, updateData),
};

