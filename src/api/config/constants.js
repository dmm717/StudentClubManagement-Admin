// Host API của BE (không kèm /api) - dùng cho cả HTTP API và SignalR
const API_HOST = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7124';

// API base URL configuration (đúng với route "api/[controller]" của BE)
export const API_BASE_URL = `${API_HOST}/api`;

// SignalR Hub URL (BE map hub tại "/notiHub")
export const SIGNALR_HUB_URL = `${API_HOST}/notiHub`;

