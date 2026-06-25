import { api } from './api';

export const aiService = {
  predictPrice: async (data: {
    cropType: string;
    quantity: number;
    location: string;
    harvestDate: string;
    season: string;
  }) => {
    const res = await api.post('/ai/predict-price', data);
    return res.data;
  },

  getHistory: async () => {
    const res = await api.get('/ai/history');
    return res.data;
  },

  getBestBuyers: async () => {
    const res = await api.get('/recommendation/best-buyer');
    return res.data;
  },
};
