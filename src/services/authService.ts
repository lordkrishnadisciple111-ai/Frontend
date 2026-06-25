import { api } from './api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'farmer' | 'buyer' | 'admin';
  location: string;
  reputationScore?: number;
  balance?: number;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  role: string;
  user: User;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  userId: string;
}

export const authService = {
  register: async (data: {
    name: string;
    email: string;
    password: string;
    role: string;
    location?: string;
  }) => {
    const res = await api.post<RegisterResponse>('/auth/register', data);
    return res.data;
  },

  login: async (email: string, password: string) => {
    const res = await api.post<LoginResponse>('/auth/login', { email, password });
    return res.data;
  },

  getProfile: async () => {
    const res = await api.get('/auth/profile');
    return res.data;
  },
};
