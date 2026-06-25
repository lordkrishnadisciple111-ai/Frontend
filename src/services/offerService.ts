import { api } from './api';

export const offerService = {
  create: async (cropId: string, offeredPrice: number) => {
    const res = await api.post('/offers/create', { cropId, offeredPrice });
    return res.data;
  },

  getAll: async () => {
    const res = await api.get('/offers');
    return res.data;
  },

  updateStatus: async (offerId: string, status: 'accepted' | 'rejected') => {
    const res = await api.patch(`/offers/${offerId}/status`, { status });
    return res.data;
  },
};
