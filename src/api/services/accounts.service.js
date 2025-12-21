/**
 * Accounts API Service
 * 
 * Mục đích:
 * - Quản lý các API liên quan đến tài khoản người dùng (accounts)
 * - Cung cấp các chức năng CRUD và quản lý tài khoản (khóa, kích hoạt, reset password, quản lý roles)
 * 
 * Endpoints sử dụng:
 * - GET /admin/accounts: Lấy danh sách tài khoản
 * - GET /admin/accounts/:id: Lấy chi tiết tài khoản
 * - PUT /admin/accounts/:id/lock: Khóa tài khoản
 * - PUT /admin/accounts/:id/activate: Kích hoạt tài khoản
 * - PUT /admin/accounts/:id/reset-password: Đặt lại mật khẩu
 * - POST /admin/accounts/:id/roles: Thêm role cho tài khoản
 * - DELETE /admin/accounts/:id/roles: Xóa role khỏi tài khoản
 * 
 * Được sử dụng bởi:
 * - src/pages/admin/Accounts.jsx: Quản lý tài khoản (tất cả các hàm)
 * - src/pages/admin/Requests.jsx: Lấy thông tin account khi hiển thị request (getById)
 * - src/pages/admin/Dashboard.jsx: Thống kê số lượng tài khoản (getAll)
 * 
 * Lưu ý bảo mật:
 * - Tất cả các endpoint đều yêu cầu quyền Admin
 * - Token authentication được xử lý tự động bởi axios interceptor
 * 
 * @module api/services/accounts.service
 */
import api from '../config/client';

export const accountsAPI = {
  /**
   * Lấy danh sách tất cả tài khoản trong hệ thống
   * 
   * Mục đích:
   * - Hiển thị danh sách tất cả user (student, leader, admin)
   * - Dùng để quản lý và thống kê
   * 
   * @returns {Promise<Object>} Promise chứa response từ API
   * @returns {Array} returns.data - Mảng các object tài khoản
   * @returns {number} returns.data[].id - ID tài khoản
   * @returns {string} returns.data[].username - Tên đăng nhập
   * @returns {string} returns.data[].email - Email
   * @returns {string} returns.data[].status - Trạng thái (active, locked)
   * @returns {Array} returns.data[].roles - Danh sách roles của user
   * 
   * @example
   * const response = await accountsAPI.getAll();
   * const accounts = response.data;
   * 
   * Sử dụng tại:
   * - src/pages/admin/Accounts.jsx: Hiển thị bảng danh sách tài khoản
   * - src/pages/admin/Dashboard.jsx: Đếm tổng số tài khoản để thống kê
   * 
   * Lưu ý:
   * - Response có thể rất lớn nếu có nhiều user
   * - Có thể cần phân trang ở phía server trong tương lai
   */
  getAll: () => api.get('/admin/accounts'),
  
  /**
   * Lấy thông tin chi tiết của một tài khoản cụ thể
   * 
   * Mục đích:
   * - Xem đầy đủ thông tin của một user (profile, roles, status, v.v.)
   * - Dùng khi cần hiển thị modal chi tiết hoặc form chỉnh sửa
   * 
   * @param {number} id - ID của tài khoản cần lấy thông tin
   * @returns {Promise<Object>} Promise chứa response từ API
   * @returns {Object} returns.data - Object chứa thông tin chi tiết tài khoản
   * @returns {number} returns.data.id - ID tài khoản
   * @returns {string} returns.data.username - Tên đăng nhập
   * @returns {string} returns.data.email - Email
   * @returns {string} returns.data.fullName - Họ tên đầy đủ
   * @returns {string} returns.data.status - Trạng thái (active, locked)
   * @returns {Array} returns.data.roles - Danh sách roles
   * @returns {Date} returns.data.createdAt - Ngày tạo tài khoản
   * 
   * @example
   * const account = await accountsAPI.getById(1);
   * console.log(account.data.username);
   * 
   * Sử dụng tại:
   * - src/pages/admin/Accounts.jsx: Khi click vào một tài khoản để xem chi tiết
   * - src/pages/admin/Requests.jsx: Lấy thông tin account liên quan đến request
   * 
   * Lưu ý:
   * - Nếu id không tồn tại, API sẽ trả về lỗi 404
   * - Response chứa đầy đủ thông tin hơn so với getAll()
   */
  getById: (id) => api.get(`/admin/accounts/${id}`),
  
  /**
   * Khóa tài khoản (lock account)
   * 
   * Mục đích:
   * - Vô hiệu hóa tài khoản, ngăn user đăng nhập
   * - Dùng khi user vi phạm quy định hoặc cần tạm thời chặn truy cập
   * 
   * @param {number} id - ID của tài khoản cần khóa
   * @returns {Promise<Object>} Promise chứa response từ API
   * @returns {Object} returns.data - Thông tin tài khoản sau khi khóa
   * @returns {string} returns.data.status - Sẽ là 'locked'
   * 
   * @example
   * await accountsAPI.lock(5);
   * // Tài khoản có ID = 5 sẽ bị khóa, không thể đăng nhập
   * 
   * Sử dụng tại:
   * - src/pages/admin/Accounts.jsx: Khi admin click nút "Khóa tài khoản"
   * 
   * Lưu ý:
   * - Tài khoản bị khóa vẫn tồn tại trong hệ thống nhưng không thể đăng nhập
   * - Có thể mở khóa lại bằng hàm activate()
   * - Cần xác nhận trước khi khóa (confirm dialog)
   */
  lock: (id) => api.put(`/admin/accounts/${id}/lock`),
  
  /**
   * Kích hoạt tài khoản (activate account)
   * 
   * Mục đích:
   * - Mở khóa tài khoản đã bị khóa trước đó
   * - Cho phép user đăng nhập lại vào hệ thống
   * 
   * @param {number} id - ID của tài khoản cần kích hoạt
   * @returns {Promise<Object>} Promise chứa response từ API
   * @returns {Object} returns.data - Thông tin tài khoản sau khi kích hoạt
   * @returns {string} returns.data.status - Sẽ là 'active'
   * 
   * @example
   * await accountsAPI.activate(5);
   * // Tài khoản có ID = 5 sẽ được mở khóa, có thể đăng nhập lại
   * 
   * Sử dụng tại:
   * - src/pages/admin/Accounts.jsx: Khi admin click nút "Kích hoạt tài khoản"
   * 
   * Lưu ý:
   * - Chỉ có thể kích hoạt tài khoản đã bị khóa trước đó
   * - Tài khoản mới tạo thường đã ở trạng thái active
   */
  activate: (id) => api.put(`/admin/accounts/${id}/activate`),
  
  /**
   * Đặt lại mật khẩu cho tài khoản
   * 
   * Mục đích:
   * - Reset mật khẩu của user về một giá trị mới
   * - Dùng khi user quên mật khẩu hoặc admin cần reset
   * 
   * @param {number} id - ID của tài khoản cần reset password
   * @param {string} newPassword - Mật khẩu mới (plain text, sẽ được hash bởi server)
   * @returns {Promise<Object>} Promise chứa response từ API
   * 
   * @example
   * await accountsAPI.resetPassword(5, 'NewPassword123!');
   * // Mật khẩu của tài khoản ID = 5 sẽ được đổi thành 'NewPassword123!'
   * 
   * Sử dụng tại:
   * - src/pages/admin/Accounts.jsx: Khi admin click nút "Reset mật khẩu"
   * 
   * Lưu ý:
   * - Mật khẩu mới nên đáp ứng yêu cầu bảo mật (độ dài, ký tự đặc biệt, v.v.)
   * - Server sẽ hash mật khẩu trước khi lưu vào database
   * - Cần xác nhận trước khi reset (confirm dialog)
   * - Nên thông báo cho user về việc mật khẩu đã được reset
   */
  resetPassword: (id, newPassword) => 
    api.put(`/admin/accounts/${id}/reset-password`, { newPassword }),
  
  /**
   * Thêm role (vai trò) cho tài khoản
   * 
   * Mục đích:
   * - Gán thêm quyền hạn cho user (ví dụ: thêm role Admin, Leader, v.v.)
   * - Một user có thể có nhiều roles
   * 
   * @param {number} id - ID của tài khoản cần thêm role
   * @param {Object} roleData - Dữ liệu role cần thêm
   * @param {string} roleData.roleName - Tên role (ví dụ: 'Admin', 'ClubLeader', 'Student')
   * @returns {Promise<Object>} Promise chứa response từ API
   * @returns {Array} returns.data.roles - Danh sách roles sau khi thêm
   * 
   * @example
   * await accountsAPI.addRole(5, { roleName: 'Admin' });
   * // User có ID = 5 sẽ có thêm quyền Admin
   * 
   * Sử dụng tại:
   * - src/pages/admin/Accounts.jsx: Khi admin muốn gán thêm role cho user
   * 
   * Lưu ý:
   * - Nếu user đã có role này rồi, API có thể trả về lỗi hoặc bỏ qua
   * - Cần validate roleName trước khi gọi API
   * - Thay đổi role sẽ ảnh hưởng đến quyền truy cập của user
   */
  addRole: (id, roleData) => 
    api.post(`/admin/accounts/${id}/roles`, roleData),
  
  /**
   * Xóa role (vai trò) khỏi tài khoản
   * 
   * Mục đích:
   * - Gỡ bỏ quyền hạn của user (ví dụ: xóa role Admin)
   * - Dùng khi cần thu hồi quyền của user
   * 
   * @param {number} id - ID của tài khoản cần xóa role
   * @param {Object} roleData - Dữ liệu role cần xóa
   * @param {string} roleData.roleName - Tên role cần xóa (ví dụ: 'Admin')
   * @returns {Promise<Object>} Promise chứa response từ API
   * @returns {Array} returns.data.roles - Danh sách roles sau khi xóa
   * 
   * @example
   * await accountsAPI.removeRole(5, { roleName: 'Admin' });
   * // User có ID = 5 sẽ mất quyền Admin
   * 
   * Sử dụng tại:
   * - src/pages/admin/Accounts.jsx: Khi admin muốn gỡ role của user
   * 
   * Lưu ý:
   * - Nếu user không có role này, API có thể trả về lỗi hoặc bỏ qua
   * - Cần xác nhận trước khi xóa role (confirm dialog)
   * - Thay đổi role sẽ ảnh hưởng đến quyền truy cập của user
   * - Không nên xóa tất cả roles của user (user sẽ không thể đăng nhập)
   */
  removeRole: (id, roleData) => 
    api.delete(`/admin/accounts/${id}/roles`, { data: roleData }),
};

