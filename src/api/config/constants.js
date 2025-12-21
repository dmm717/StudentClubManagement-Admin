/**
 * API Configuration Constants
 * 
 * Mục đích:
 * - Định nghĩa các hằng số cấu hình cho API client
 * - Quản lý URL base của API cho các môi trường khác nhau (development, production)
 * - Hỗ trợ cấu hình linh hoạt thông qua environment variables
 * 
 * Cấu hình:
 * - Development: Sử dụng URL Azure mặc định hoặc VITE_API_BASE_URL từ .env
 * - Production: Sử dụng relative path '/api' (proxy qua Vercel)
 * 
 * Environment Variables:
 * - VITE_API_BASE_URL: URL tùy chỉnh cho API (ưu tiên cao nhất)
 * 
 * @module api/config/constants
 */

// URL mặc định của API server trên Azure (dùng cho development)
const DEFAULT_API_HOST = 'https://studentclubmanagementsystem-f9cbhdhccwgafmd0.southeastasia-01.azurewebsites.net';

/**
 * Xác định host của API dựa trên môi trường
 * - Nếu có VITE_API_BASE_URL trong .env → dùng giá trị đó
 * - Nếu không và đang ở production → dùng empty string (relative path)
 * - Nếu không và đang ở development → dùng DEFAULT_API_HOST
 */
const API_HOST = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.PROD ? '' : DEFAULT_API_HOST);

/**
 * Base URL của API
 * - Production: '/api' (relative path, sẽ được proxy bởi Vercel)
 * - Development: `${API_HOST}/api` (full URL đến Azure server)
 * 
 * @constant {string} API_BASE_URL
 * @example
 * // Development: 'https://studentclubmanagementsystem-f9cbhdhccwgafmd0.southeastasia-01.azurewebsites.net/api'
 * // Production: '/api'
 */
export const API_BASE_URL = import.meta.env.PROD 
  ? '/api' 
  : `${API_HOST}/api`;
