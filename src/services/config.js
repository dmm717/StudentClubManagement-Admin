// API base URL configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://swpclubmanagement.azurewebsites.net';

// SignalR Hub URL
export const SIGNALR_HUB_URL = `${API_BASE_URL}/notiHub`;
