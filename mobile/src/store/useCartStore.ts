import { create } from 'zustand';
import { MenuItem } from '../types';

export interface CartItem {
  id?: string;
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

interface CartState {
  items: CartItem[];
  tableNumber: string;
  setTableNumber: (table: string) => void;
  addItem: (item: MenuItem, notes?: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  tableNumber: 'Table 1',

  setTableNumber: (tableNumber) => set({ tableNumber }),

  addItem: (menuItem, notes) => {
    const existing = get().items.find((i) => i.menuItem.id === menuItem.id || i.id === menuItem.id);
    if (existing) {
      set({
        items: get().items.map((i) =>
          (i.menuItem.id === menuItem.id || i.id === menuItem.id)
            ? { ...i, quantity: i.quantity + 1, notes: notes || i.notes }
            : i
        )
      });
    } else {
      set({ items: [...get().items, { id: menuItem.id, menuItem, quantity: 1, notes }] });
    }
  },

  removeItem: (itemId) => {
    set({ items: get().items.filter((i) => i.menuItem.id !== itemId && i.id !== itemId) });
  },

  updateQuantity: (itemId, delta) => {
    set({
      items: get().items
        .map((i) => {
          if (i.menuItem.id === itemId || i.id === itemId) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[]
    });
  },

  clearCart: () => set({ items: [] }),

  getTotal: () => {
    return get().items.reduce((sum, item) => sum + (item.menuItem?.price || 0) * item.quantity, 0);
  }
}));
