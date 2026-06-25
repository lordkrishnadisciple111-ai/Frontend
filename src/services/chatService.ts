import { api } from './api';

export const chatService = {
  getConversations: async () => {
    const res = await api.get('/chat/conversations');
    return res.data;
  },

  getHistory: async (contactId: string) => {
    const res = await api.get(`/chat/history/${contactId}`);
    return res.data;
  },

  markAsSeen: async (contactId: string) => {
    const res = await api.post(`/chat/seen/${contactId}`);
    return res.data;
  },
};
