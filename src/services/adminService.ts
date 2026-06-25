import { api } from './api';

export const adminService = {
  getAnalytics: async () => {
    const res = await api.get('/admin/analytics');
    return res.data;
  },
};

export const farmerService = {
  getDashboard: async () => {
    const res = await api.get('/farmer/dashboard');
    return res.data;
  },
};
