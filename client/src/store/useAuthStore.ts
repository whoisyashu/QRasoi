import { create } from 'zustand';
import { RestaurantProfile, UserRole } from '../types';
import { MOCK_RESTAURANT } from '../constants/mockData';
import { apiClient } from '../services/api';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  restaurantId?: string;
  is2FAVerified?: boolean;
}

export interface ChefUser {
  id: string;
  full_name: string;
  email: string;
  role: string;
  status: 'active' | 'disabled';
  created_at?: string;
}

export interface RegisterRestaurantData {
  ownerName: string;
  email: string;
  password: string;
  phone: string;
  restaurantName: string;
  address: string;
  cuisine: string;
  category: string;
  description?: string;
  logoUrl?: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  is2FAVerified: boolean;
  temp2FAToken: string | null;
  is2FAConfigured: boolean;
  currentRole: UserRole;
  restaurant: RestaurantProfile;
  isLoading: boolean;
  error: string | null;
  chefs: ChefUser[];

  // Actions
  checkAuth: () => Promise<boolean>;
  loginOwner: (email: string, password: string) => Promise<boolean>;
  loginChef: (email: string, password: string) => Promise<boolean>;
  loginAdmin: (email: string, password: string) => Promise<{ requires2FA: boolean; is2FAConfigured?: boolean; tempToken?: string; error?: string }>;
  verifyAdmin2FA: (totpCode: string) => Promise<boolean>;
  setupAdmin2FA: () => Promise<{ secret: string; qrCodeUrl: string; tempSetupToken: string; backupCodes: string[] } | null>;
  enableAdmin2FA: (tempSetupToken: string, totpCode: string) => Promise<{ success: boolean; backupCodes?: string[]; error?: string }>;
  disableAdmin2FA: (password: string, totpCode: string) => Promise<boolean>;
  regenerateBackupCodes: (totpCode: string) => Promise<string[] | null>;
  registerRestaurant: (data: RegisterRestaurantData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  fetchRestaurantProfile: () => Promise<void>;
  updateRestaurant: (updated: Partial<RestaurantProfile>) => Promise<boolean>;

  // Chef Management (Owner only)
  fetchChefs: () => Promise<void>;
  createChef: (fullName: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  toggleChefStatus: (id: string, newStatus: 'active' | 'disabled') => Promise<boolean>;
  resetChefPassword: (id: string, newPassword: string) => Promise<boolean>;
  deleteChef: (id: string) => Promise<boolean>;
}

// Synchronous hydration from localStorage
const getInitialAuthState = () => {
  if (typeof window === 'undefined') {
    return { user: null, isAuthenticated: false, role: 'customer' as UserRole, is2FAVerified: false };
  }
  const token = localStorage.getItem('qrasoi_token');
  const storedUserRaw = localStorage.getItem('qrasoi_user');
  if (token && storedUserRaw) {
    try {
      const user = JSON.parse(storedUserRaw) as AuthUser;
      const is2FA = user.role === 'admin' ? Boolean(user.is2FAVerified ?? true) : false;
      return { user, isAuthenticated: true, role: user.role, is2FAVerified: is2FA };
    } catch (e) {
      // Fallback
    }
  }
  return { user: null, isAuthenticated: false, role: 'customer' as UserRole, is2FAVerified: false };
};

const initialAuth = getInitialAuthState();

export const useAuthStore = create<AuthState>((set, get) => ({
  user: initialAuth.user,
  isAuthenticated: initialAuth.isAuthenticated,
  is2FAVerified: initialAuth.is2FAVerified,
  temp2FAToken: null,
  is2FAConfigured: false,
  currentRole: initialAuth.role,
  restaurant: MOCK_RESTAURANT,
  isLoading: false,
  error: null,
  chefs: [],

  checkAuth: async () => {
    const token = localStorage.getItem('qrasoi_token');
    if (!token) {
      set({ user: null, isAuthenticated: false, is2FAVerified: false, currentRole: 'customer', isLoading: false });
      return false;
    }

    try {
      const response = await apiClient.get('/auth/me');
      const { user, restaurant } = response.data;

      if (user) {
        localStorage.setItem('qrasoi_user', JSON.stringify(user));
        set({
          user,
          isAuthenticated: true,
          is2FAVerified: user.role === 'admin' ? true : false,
          currentRole: user.role,
          restaurant: restaurant || get().restaurant,
          isLoading: false,
        });

        if (user.role === 'owner') {
          await get().fetchRestaurantProfile();
        }
        return true;
      } else {
        throw new Error('Invalid user payload');
      }
    } catch (err) {
      console.warn('Session verification failed or token expired:', err);
      localStorage.removeItem('qrasoi_token');
      localStorage.removeItem('qrasoi_user');
      set({
        user: null,
        isAuthenticated: false,
        is2FAVerified: false,
        currentRole: 'customer',
        isLoading: false,
      });
      return false;
    }
  },

  loginOwner: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { token, user } = response.data;

      const loggedInUser: AuthUser = {
        id: user?.id || `user-${Date.now()}`,
        email: user?.email || email,
        name: user?.name || email.split('@')[0],
        role: 'owner',
        restaurantId: user?.restaurantId,
      };

      if (token) {
        localStorage.setItem('qrasoi_token', token);
        localStorage.setItem('qrasoi_user', JSON.stringify(loggedInUser));
      }

      set({
        user: loggedInUser,
        isAuthenticated: true,
        is2FAVerified: false,
        currentRole: 'owner',
        isLoading: false,
      });

      await get().fetchRestaurantProfile();
      return true;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Invalid credentials or server error.';
      set({ isLoading: false, error: errorMsg });
      return false;
    }
  },

  loginChef: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post('/auth/chef/login', { email, password });
      const { token, user } = response.data;

      const loggedInUser: AuthUser = {
        id: user?.id || `chef-${Date.now()}`,
        email: user?.email || email,
        name: user?.name || email.split('@')[0],
        role: 'chef',
        restaurantId: user?.restaurantId,
      };

      if (token) {
        localStorage.setItem('qrasoi_token', token);
        localStorage.setItem('qrasoi_user', JSON.stringify(loggedInUser));
      }

      set({
        user: loggedInUser,
        isAuthenticated: true,
        is2FAVerified: false,
        currentRole: 'chef',
        isLoading: false,
      });
      return true;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Invalid chef credentials.';
      set({ isLoading: false, error: errorMsg });
      return false;
    }
  },

  // STAGE 1: Admin Email & Password login
  loginAdmin: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post('/auth/admin/login', { email, password });
      const { requires2FA, token, user, tempToken, is2FAConfigured } = response.data;

      // If 2FA is required for this account
      if (requires2FA) {
        set({
          isLoading: false,
          temp2FAToken: tempToken,
          is2FAConfigured: Boolean(is2FAConfigured),
        });
        return {
          requires2FA: true,
          is2FAConfigured: Boolean(is2FAConfigured),
          tempToken,
        };
      }

      // If 2FA is NOT required (2FA turned off) -> Save token & log in directly!
      const loggedInUser: AuthUser = {
        id: user?.id || 'admin-super-01',
        email: user?.email || email,
        name: user?.name || 'Platform Super Admin',
        role: 'admin',
        is2FAVerified: true,
      };

      if (token) {
        localStorage.setItem('qrasoi_token', token);
        localStorage.setItem('qrasoi_user', JSON.stringify(loggedInUser));
      }

      set({
        user: loggedInUser,
        isAuthenticated: true,
        is2FAVerified: true,
        currentRole: 'admin',
        isLoading: false,
        temp2FAToken: null,
      });

      return { requires2FA: false };
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Invalid administrator credentials.';
      set({ isLoading: false, error: errorMsg });
      return { requires2FA: false, error: errorMsg };
    }
  },

  // STAGE 2: TOTP Code / Backup Code verification
  verifyAdmin2FA: async (totpCode) => {
    set({ isLoading: true, error: null });
    try {
      const tempToken = get().temp2FAToken;
      const response = await apiClient.post('/auth/admin/2fa/verify', {
        tempToken: tempToken || 'stage1-active-token',
        totpCode,
      });

      const { token, user } = response.data;
      const loggedInUser: AuthUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: 'admin',
        is2FAVerified: true,
      };

      if (token) {
        localStorage.setItem('qrasoi_token', token);
        localStorage.setItem('qrasoi_user', JSON.stringify(loggedInUser));
      }

      set({
        user: loggedInUser,
        isAuthenticated: true,
        is2FAVerified: true,
        currentRole: 'admin',
        isLoading: false,
        temp2FAToken: null,
      });
      return true;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || '2FA verification failed.';
      set({ isLoading: false, error: errorMsg });
      return false;
    }
  },

  setupAdmin2FA: async () => {
    try {
      const response = await apiClient.post('/admin/2fa/setup');
      return response.data;
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Failed to setup 2FA' });
      return null;
    }
  },

  enableAdmin2FA: async (tempSetupToken, totpCode) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post('/admin/2fa/enable', { tempSetupToken, totpCode });
      set({ isLoading: false, is2FAConfigured: true });
      return { success: true, backupCodes: response.data.backupCodes };
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to enable 2FA';
      set({ isLoading: false, error: errorMsg });
      return { success: false, error: errorMsg };
    }
  },

  disableAdmin2FA: async (password, totpCode) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.post('/admin/2fa/disable', { password, totpCode });
      set({ isLoading: false, is2FAConfigured: false });
      return true;
    } catch (err: any) {
      set({ isLoading: false, error: err.response?.data?.error || 'Failed to disable 2FA' });
      return false;
    }
  },

  regenerateBackupCodes: async (totpCode) => {
    try {
      const response = await apiClient.post('/admin/2fa/regenerate-backup-codes', { totpCode });
      return response.data.backupCodes || null;
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Failed to regenerate backup codes' });
      return null;
    }
  },

  registerRestaurant: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.post('/auth/register', data);
      set({ isLoading: false });
      return { success: true };
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Registration failed.';
      set({ isLoading: false, error: errorMsg });
      return { success: false, error: errorMsg };
    }
  },

  logout: () => {
    localStorage.removeItem('qrasoi_token');
    localStorage.removeItem('qrasoi_user');
    set({
      user: null,
      isAuthenticated: false,
      is2FAVerified: false,
      temp2FAToken: null,
      currentRole: 'customer',
      isLoading: false,
      error: null,
      chefs: [],
      restaurant: MOCK_RESTAURANT,
    });
  },

  fetchRestaurantProfile: async () => {
    try {
      const response = await apiClient.get('/owner/restaurant');
      if (response.data) {
        set({ restaurant: response.data });
      }
    } catch (err) {
      console.warn('Could not fetch restaurant profile:', err);
    }
  },

  updateRestaurant: async (updated) => {
    try {
      const current = get().restaurant;
      const merged = { ...current, ...updated };

      set({ restaurant: merged });

      const response = await apiClient.put('/owner/restaurant', merged);
      if (response.data?.restaurant) {
        set({ restaurant: { ...merged, ...response.data.restaurant } });
      }
      return true;
    } catch (err: any) {
      console.error('Failed to save restaurant settings:', err);
      return false;
    }
  },

  fetchChefs: async () => {
    try {
      const response = await apiClient.get('/owner/chefs');
      set({ chefs: response.data.chefs || [] });
    } catch (err) {
      console.warn('Failed to fetch chefs list:', err);
    }
  },

  createChef: async (fullName, email, password) => {
    try {
      await apiClient.post('/owner/chefs', { fullName, email, password });
      await get().fetchChefs();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.error || 'Failed to create chef account' };
    }
  },

  toggleChefStatus: async (id, newStatus) => {
    try {
      await apiClient.patch(`/owner/chefs/${id}/status`, { status: newStatus });
      await get().fetchChefs();
      return true;
    } catch (err) {
      return false;
    }
  },

  resetChefPassword: async (id, newPassword) => {
    try {
      await apiClient.post(`/owner/chefs/${id}/reset-password`, { newPassword });
      return true;
    } catch (err) {
      return false;
    }
  },

  deleteChef: async (id) => {
    try {
      await apiClient.delete(`/owner/chefs/${id}`);
      await get().fetchChefs();
      return true;
    } catch (err) {
      return false;
    }
  },
}));
