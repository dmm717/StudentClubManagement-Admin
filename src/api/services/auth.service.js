import api from '../config/client';

export const authAPI = {
  login: (username, password) => {
    return api.post('/auth/login', { username, password });
  },
};


