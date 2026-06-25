import { api } from './api';

export interface CropListing {
  _id: string;
  cropName: string;
  category: string;
  quantity: number;
  price: number;
  location: string;
  description: string;
  imageUrls: string[];
  farmer: { _id: string; name: string; location: string; reputationScore?: number };
  status: string;
  createdAt: string;
}

export interface CropFilters {
  state?: string;
  category?: string;
  maxPrice?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export const cropService = {
  getAll: async (filters: CropFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.state) params.set('state', filters.state);
    if (filters.category) params.set('category', filters.category);
    if (filters.maxPrice) params.set('maxPrice', String(filters.maxPrice));
    if (filters.search) params.set('search', filters.search);
    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));

    const res = await api.get(`/crops/all?${params.toString()}`);
    return res.data;
  },

  create: async (data: {
    cropName: string;
    category: string;
    quantity: number;
    price: number;
    location: string;
    description: string;
    imageUrls: string[];
  }) => {
    const res = await api.post('/crops/create', data);
    return res.data;
  },
};
