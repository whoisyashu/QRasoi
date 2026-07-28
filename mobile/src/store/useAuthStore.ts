import { create } from 'zustand';
import { User } from '../types';
import { storageService } from '../services/storage.service';
import { apiClient } from '../services/api.service';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  chefLogin: (pin: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email, password) => {
    const res = await apiClient.post('/auth/login', { email, password });
    const { token, user } = res.data.data;
    await storageService.setToken(token);
    await storageService.setUserSession(user);
    set({ user, token, isAuthenticated: true });
  },

  chefLogin: async (pin) => {
    const res = await apiClient.post('/auth/chef-login', { pin });
    const { token, user } = res.data.data;
    await storageService.setToken(token);
    await storageService.setUserSession(user);
    set({ user, token, isAuthenticated: true });
  },

  logout: async () => {
    await storageService.clearAll();
    set({ user: null, token: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    set({ isLoading: true });
    const token = await storageService.getToken();
    const user = await storageService.getUserSession<User>();
    if (token && user) {
      set({ user, token, isAuthenticated: true, isLoading: false });
    } else {
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  }
}));
