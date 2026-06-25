import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../services/authService';
import type { CropListing } from '../services/cropService';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface ChatMessage {
  _id: string;
  sender: string;
  recipient: string;
  message: string;
  seen: boolean;
  unread: boolean;
  timestamp: string;
}

export interface Conversation {
  contact: { _id: string; name: string; role: string; location: string };
  lastMessage: string;
  lastMessageTimestamp: string;
  unreadCount: number;
}

interface AppState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  crops: CropListing[];
  cropsPagination: { total: number; page: number; pages: number };
  dashboardData: Record<string, unknown> | null;
  adminAnalytics: Record<string, unknown> | null;
  predictionResult: Record<string, unknown> | null;
  buyerRecommendations: unknown[];
  offers: unknown[];
  conversations: Conversation[];
  activeMessages: ChatMessage[];
  activeContactId: string | null;
  typingUsers: Set<string>;
  notifications: unknown[];
  toasts: Toast[];

  setAuth: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setCrops: (crops: CropListing[], pagination: { total: number; page: number; pages: number }) => void;
  addCropOptimistic: (crop: CropListing) => void;
  setDashboardData: (data: Record<string, unknown>) => void;
  setAdminAnalytics: (data: Record<string, unknown>) => void;
  setPredictionResult: (data: Record<string, unknown> | null) => void;
  setBuyerRecommendations: (data: unknown[]) => void;
  setOffers: (offers: unknown[]) => void;
  setConversations: (conversations: Conversation[]) => void;
  setActiveMessages: (messages: ChatMessage[]) => void;
  setActiveContactId: (id: string | null) => void;
  addMessage: (message: ChatMessage) => void;
  setTyping: (userId: string, isTyping: boolean) => void;
  addNotification: (notification: unknown) => void;
  addToast: (type: Toast['type'], message: string) => void;
  removeToast: (id: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      crops: [],
      cropsPagination: { total: 0, page: 1, pages: 0 },
      dashboardData: null,
      adminAnalytics: null,
      predictionResult: null,
      buyerRecommendations: [],
      offers: [],
      conversations: [],
      activeMessages: [],
      activeContactId: null,
      typingUsers: new Set(),
      notifications: [],
      toasts: [],

      setAuth: (user, token) => {
        localStorage.setItem('kisansetu_token', token);
        set({ user, token, isAuthenticated: true });
      },

      logout: () => {
        localStorage.removeItem('kisansetu_token');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          crops: [],
          dashboardData: null,
          activeMessages: [],
          activeContactId: null,
        });
      },

      setLoading: (loading) => set({ isLoading: loading }),

      setCrops: (crops, pagination) => set({ crops, cropsPagination: pagination }),

      addCropOptimistic: (crop) =>
        set((state) => ({
          crops: [crop, ...state.crops],
          cropsPagination: { ...state.cropsPagination, total: state.cropsPagination.total + 1 },
        })),

      setDashboardData: (data) => set({ dashboardData: data }),
      setAdminAnalytics: (data) => set({ adminAnalytics: data }),
      setPredictionResult: (data) => set({ predictionResult: data }),
      setBuyerRecommendations: (data) => set({ buyerRecommendations: data }),
      setOffers: (offers) => set({ offers }),
      setConversations: (conversations) => set({ conversations }),
      setActiveMessages: (messages) => set({ activeMessages: messages }),
      setActiveContactId: (id) => set({ activeContactId: id }),

      addMessage: (message) =>
        set((state) => ({
          activeMessages: [...state.activeMessages, message],
        })),

      setTyping: (userId, isTyping) => {
        const typing = new Set(get().typingUsers);
        if (isTyping) typing.add(userId);
        else typing.delete(userId);
        set({ typingUsers: typing });
      },

      addNotification: (notification) =>
        set((state) => ({ notifications: [notification, ...state.notifications] })),

      addToast: (type, message) => {
        const id = Date.now().toString();
        set((state) => ({ toasts: [...state.toasts, { id, type, message }] }));
        setTimeout(() => get().removeToast(id), 4000);
      },

      removeToast: (id) =>
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
    }),
    {
      name: 'kisansetu-store',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
