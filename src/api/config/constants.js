const DEFAULT_API_HOST = 'https://studentclubmanagementsystem-f9cbhdhccwgafmd0.southeastasia-01.azurewebsites.net';

const API_HOST = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.PROD ? '' : DEFAULT_API_HOST);

export const API_BASE_URL = import.meta.env.PROD 
  ? '/api' 
  : `${API_HOST}/api`;
