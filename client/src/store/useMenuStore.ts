import { create } from 'zustand';
import { Category, MenuItem } from '../types';
import { MOCK_CATEGORIES, MOCK_MENU_ITEMS } from '../constants/mockData';
import { apiClient } from '../services/api';

interface MenuState {
  categories: Category[];
  items: MenuItem[];
  searchQuery: string;
  selectedCategory: string;
  isLoading: boolean;
  isSuspended: boolean;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  fetchMenuItems: () => Promise<void>;
  fetchPublicMenu: (slug: string) => Promise<void>;
  toggleAvailability: (itemId: string) => Promise<void>;
  addMenuItem: (item: Omit<MenuItem, 'id'>) => Promise<void>;
  updateMenuItem: (id: string, updated: Partial<MenuItem>) => Promise<void>;
  deleteMenuItem: (id: string) => Promise<void>;
}

export const useMenuStore = create<MenuState>((set, get) => ({
  categories: MOCK_CATEGORIES,
  items: MOCK_MENU_ITEMS,
  searchQuery: '',
  selectedCategory: 'cat-all',
  isLoading: false,
  isSuspended: false,

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),

  fetchMenuItems: async () => {
    set({ isLoading: true });
    try {
      const response = await apiClient.get('/owner/menu');
      if (Array.isArray(response.data) && response.data.length > 0) {
        set({ items: response.data, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (err) {
      console.warn('Failed to fetch menu items from backend:', err);
      set({ isLoading: false });
    }
  },

  fetchPublicMenu: async (slug: string) => {
    set({ isLoading: true, isSuspended: false });
    try {
      const response = await apiClient.get(`/public/r/${slug}`);
      if (response.data) {
        const { items: rawItems, categories: rawCats } = response.data;
        if (Array.isArray(rawItems) && rawItems.length > 0) {
          set({ items: rawItems, isLoading: false, isSuspended: false });
        } else {
          set({ isLoading: false, isSuspended: false });
        }
        if (Array.isArray(rawCats) && rawCats.length > 0) {
          const mappedCats: Category[] = [
            { id: 'cat-all', name: 'All Items', icon: 'Utensils' },
            ...rawCats.map((c: any) => ({
              id: c.id || `cat-${c.name}`,
              name: c.name,
              icon: c.icon || 'Utensils',
            })),
          ];
          set({ categories: mappedCats });
        }
      }
    } catch (err: any) {
      if (err.response?.status === 403 || err.response?.data?.isSuspended) {
        set({ isSuspended: true, isLoading: false });
      } else {
        console.warn('Failed to fetch public menu from backend:', err);
        set({ isLoading: false });
      }
    }
  },

  addMenuItem: async (newItem) => {
    const tempId = `item-${Date.now()}`;
    const itemToAdd: MenuItem = { ...newItem, id: tempId };
    set((state) => ({ items: [itemToAdd, ...state.items] }));

    try {
      const response = await apiClient.post('/owner/menu', newItem);
      if (response.data && response.data.id) {
        const savedItem: MenuItem = {
          id: response.data.id,
          name: response.data.name || newItem.name,
          description: response.data.description || newItem.description,
          price: Number(response.data.price || newItem.price),
          category: response.data.category || newItem.category,
          dietary: response.data.dietary || newItem.dietary,
          image: response.data.image_url || response.data.image || newItem.image || '',
          isAvailable: response.data.is_available ?? newItem.isAvailable ?? true,
          isPopular: response.data.is_popular ?? newItem.isPopular ?? false,
          preparationTimeMinutes: response.data.preparation_time_minutes || newItem.preparationTimeMinutes || 15,
        };

        set((state) => ({
          items: state.items.map((i) => (i.id === tempId ? savedItem : i)),
        }));
      }
    } catch (err) {
      console.error('Failed to save menu item to Supabase:', err);
    }
  },

  toggleAvailability: async (itemId) => {
    const currentItem = get().items.find((i) => i.id === itemId);
    if (!currentItem) return;

    const newStatus = !currentItem.isAvailable;

    set((state) => ({
      items: state.items.map((item) =>
        item.id === itemId ? { ...item, isAvailable: newStatus } : item
      ),
    }));

    try {
      await apiClient.patch(`/owner/menu/${itemId}/availability`, { isAvailable: newStatus });
    } catch (err) {
      console.warn('Failed to sync availability to Supabase:', err);
    }
  },

  updateMenuItem: async (id, updated) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, ...updated } : item
      ),
    }));

    try {
      await apiClient.put(`/owner/menu/${id}`, updated);
    } catch (err) {
      console.warn('Failed to update menu item in Supabase:', err);
    }
  },

  deleteMenuItem: async (id) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));

    try {
      await apiClient.delete(`/owner/menu/${id}`);
    } catch (err) {
      console.warn('Failed to delete menu item from Supabase:', err);
    }
  },
}));
