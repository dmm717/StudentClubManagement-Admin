// Host API của BE (không kèm /api) - dùng cho cả HTTP API và SignalR
// Khi deploy trên Vercel, sử dụng relative URL để tránh CORS (Vercel sẽ proxy qua rewrites)
// Khi dev local, sử dụng absolute URL từ env hoặc default
const API_HOST = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.PROD ? '' : 'https://studentclubmanagementsystem-f9cbhdhccwgafmd0.southeastasia-01.azurewebsites.net');

// API base URL configuration (đúng với route "api/[controller]" của BE)
// Production: sử dụng relative URL "/api" (Vercel proxy)
// Development: sử dụng absolute URL từ API_HOST
export const API_BASE_URL = import.meta.env.PROD 
  ? '/api' 
  : `${API_HOST}/api`;

// SignalR Hub URL (BE map hub tại "/notiHub")
// SignalR không thể proxy qua Vercel rewrites, nên luôn dùng absolute URL
export const SIGNALR_HUB_URL = `${API_HOST || 'https://studentclubmanagementsystem-f9cbhdhccwgafmd0.southeastasia-01.azurewebsites.net'}/notiHub`;

