/**
 * API Module - Entry Point
 * 
 * Mục đích: 
 * - File này là điểm xuất (export) chính của module API
 * - Tập trung tất cả các service API để dễ dàng import và sử dụng trong các component
 * - Giúp quản lý và tổ chức code API một cách có hệ thống
 * 
 * Cấu trúc:
 * - Export tất cả các service từ thư mục services/
 * - Mỗi service chứa các hàm API tương ứng với một domain cụ thể
 * 
 * Cách sử dụng:
 * import { authAPI, accountsAPI, clubsAPI } from '@/api';
 * 
 * @module api
 */

// Authentication Service - Xử lý đăng nhập, xác thực
export * from './services/auth.service';

// Club Leader Request Service - Xử lý yêu cầu làm leader của câu lạc bộ
export * from './services/clubLeaderRequest.service';

// Clubs Service - Quản lý thông tin câu lạc bộ
export * from './services/clubs.service';

// Accounts Service - Quản lý tài khoản người dùng (lock, activate, reset password, roles)
export * from './services/accounts.service';

// Activities Service - Quản lý hoạt động của các câu lạc bộ
export * from './services/activities.service';

