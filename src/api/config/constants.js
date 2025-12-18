const API_HOST = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.PROD ? '' : 'https://studentclubmanagementsystem-f9cbhdhccwgafmd0.southeastasia-01.azurewebsites.net');

export const API_BASE_URL = import.meta.env.PROD 
  ? '/api' 
  : `${API_HOST}/api`;

export const SIGNALR_HUB_URL = `${API_HOST || 'https://studentclubmanagementsystem-f9cbhdhccwgafmd0.southeastasia-01.azurewebsites.net'}/notiHub`;

