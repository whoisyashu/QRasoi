import { create } from 'zustand';
import { MenuItem, Category } from '../types';
import { apiClient } from '../services/api.service';

interface MenuState {
  items: MenuItem[];
  categories: Category[];
  isLoading: boolean;
  fetchMenuItems: (restaurantId?: string, slug?: string) => Promise<void>;
  toggleAvailability: (itemId: string) => Promise<void>;
  addMenuItem: (item: Partial<MenuItem>) => Promise<void>;
  updateMenuItem: (itemId: string, item: Partial<MenuItem>) => Promise<void>;
  deleteMenuItem: (itemId: string) => Promise<void>;
}

export const useMenuStore = create<MenuState>((set, get) => ({
  items: [],
  categories: [],
  isLoading: false,

  fetchMenuItems: async (restaurantId, slug) => {
    set({ isLoading: true });
    try {
      let url = '/owner/menu';
      if (slug) {
        url = `/public/menu/${slug}`;
      } else if (restaurantId) {
        url = `/owner/menu?restaurantId=${restaurantId}`;
      }
      const res = await apiClient.get(url);
      const data = res.data?.data || res.data;
      
      const rawItems = Array.isArray(data) ? data : data?.items || data?.menuItems || [];
      const rawCategories = data?.categories || [];

      const formattedItems: MenuItem[] = rawItems.map((i: any) => ({
        id: i.id || i._id,
        restaurantId: i.restaurant_id || i.restaurantId,
        categoryId: i.category || i.category_id || i.categoryId || 'Main Course',
        name: i.name || i.item_name,
        description: i.description || '',
        price: Number(i.price || 0),
        imageUrl: i.image_url || i.imageUrl,
        isVeg: i.dietary === 'veg' || i.is_veg === true || i.isVeg === true,
        isAvailable: i.is_available ?? i.isAvailable ?? true,
      }));

      set({ items: formattedItems, categories: rawCategories });
    } catch (e) {
      console.warn('Failed to fetch menu items:', e);
    } finally {
      set({ isLoading: false });
    }
  },

  toggleAvailability: async (itemId: string) => {
    const currentItem = get().items.find(i => i.id === itemId);
    if (!currentItem) return;

    const nextAvailable = !currentItem.isAvailable;
    set((state) => ({
      items: state.items.map(i => (i.id === itemId ? { ...i, isAvailable: nextAvailable } : i))
    }));

    try {
      await apiClient.patch(`/owner/menu/items/${itemId}/availability`, { isAvailable: nextAvailable });
    } catch (e) {
      console.warn('Failed to toggle availability on server:', e);
    }
  },

  addMenuItem: async (itemData) => {
    try {
      const res = await apiClient.post('/owner/menu/items', {
        name: itemData.name,
        description: itemData.description,
        price: itemData.price,
        category: itemData.categoryId,
        dietary: itemData.isVeg ? 'veg' : 'non-veg',
        isAvailable: true,
      });
      const created = res.data?.data || res.data;
      const newItem: MenuItem = {
        id: created.id || `dish-${Date.now()}`,
        name: created.name || itemData.name || '',
        categoryId: created.category || itemData.categoryId || 'Main Course',
        price: Number(created.price || itemData.price || 0),
        isVeg: itemData.isVeg ?? true,
        isAvailable: true,
        description: itemData.description || '',
      };
      set((state) => ({ items: [newItem, ...state.items] }));
    } catch (e) {
      console.warn('Failed to add menu item:', e);
      // Fallback optimistic update
      const newItem: MenuItem = {
        id: `dish-${Date.now()}`,
        name: itemData.name || '',
        categoryId: itemData.categoryId || 'Main Course',
        price: Number(itemData.price || 0),
        isVeg: itemData.isVeg ?? true,
        isAvailable: true,
        description: itemData.description || '',
      };
      set((state) => ({ items: [newItem, ...state.items] }));
    }
  },

  updateMenuItem: async (itemId, itemData) => {
    set((state) => ({
      items: state.items.map(i => (i.id === itemId ? { ...i, ...itemData } : i))
    }));
    try {
      await apiClient.put(`/owner/menu/items/${itemId}`, itemData);
    } catch (e) {
      console.warn('Failed to update menu item:', e);
    }
  },

  deleteMenuItem: async (itemId) => {
    set((state) => ({
      items: state.items.filter(i => i.id !== itemId)
    }));
    try {
      await apiClient.delete(`/owner/menu/items/${itemId}`);
    } catch (e) {
      console.warn('Failed to delete menu item:', e);
    }
  }
}));
