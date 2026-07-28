import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'qrasoi_jwt_token';
const USER_KEY = 'qrasoi_user_session';

export const storageService = {
  async setToken(token: string): Promise<void> {
    if (!token) return;
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, String(token));
    } catch (e) {
      console.warn('SecureStore setToken warning:', e);
    }
  },

  async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (e) {
      return null;
    }
  },

  async removeToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch (e) {}
  },

  async setUserSession(user: object): Promise<void> {
    if (!user) return;
    try {
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.warn('SecureStore setUserSession warning:', e);
    }
  },

  async getUserSession<T>(): Promise<T | null> {
    try {
      const raw = await SecureStore.getItemAsync(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },

  async clearAll(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch (e) {}
    try {
      await SecureStore.deleteItemAsync(USER_KEY);
    } catch (e) {}
  }
};
