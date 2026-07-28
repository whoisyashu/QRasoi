import { create } from 'zustand';
import { Order } from '../types';
import { apiClient } from '../services/api.service';

interface OrderState {
  orders: Order[];
  isLoading: boolean;
  filterStatus: string;
  fetchLiveOrders: (restaurantId: string) => Promise<void>;
  updateOrderItemStatus: (orderId: string, itemId: string, status: string) => Promise<void>;
  cancelOrder: (orderId: string) => Promise<void>;
  setFilterStatus: (status: string) => void;
  mergeServerOrders: (serverOrders: Order[]) => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  isLoading: false,
  filterStatus: 'ALL',

  fetchLiveOrders: async (restaurantId: string) => {
    set({ isLoading: true });
    try {
      const res = await apiClient.get(`/owner/orders?restaurantId=${restaurantId}`);
      const serverOrders: Order[] = res.data.data || [];
      get().mergeServerOrders(serverOrders);
    } finally {
      set({ isLoading: false });
    }
  },

  mergeServerOrders: (serverOrders: Order[]) => {
    const existingOrders = get().orders;
    const merged = serverOrders.map((serverOrder) => {
      const existingOrder = existingOrders.find((o) => o.id === serverOrder.id);
      if (!existingOrder) return serverOrder;

      const mergedItems = serverOrder.items.map((serverItem) => {
        const existingItem = existingOrder.items.find((i) => i.id === serverItem.id);
        const isLocalReady = existingItem?.status === 'ready' || existingItem?.notes?.includes('[STATUS:READY]');
        if (isLocalReady) {
          return {
            ...serverItem,
            status: 'ready' as const,
            notes: serverItem.notes?.includes('[STATUS:READY]') ? serverItem.notes : `${serverItem.notes || ''} [STATUS:READY]`
          };
        }
        return serverItem;
      });

      return { ...serverOrder, items: mergedItems };
    });

    set({ orders: merged });
  },

  updateOrderItemStatus: async (orderId, itemId, status) => {
    set((state) => ({
      orders: state.orders.map((o) => {
        if (o.id !== orderId) return o;
        return {
          ...o,
          items: o.items.map((i) => (i.id === itemId ? { ...i, status: status as any } : i))
        };
      })
    }));

    await apiClient.patch(`/chef/orders/${orderId}/items/${itemId}/status`, { status });
  },

  cancelOrder: async (orderId) => {
    await apiClient.patch(`/owner/orders/${orderId}/cancel`);
    set((state) => ({
      orders: state.orders.map((o) => (o.id === orderId ? { ...o, status: 'cancelled' } : o))
    }));
  },

  setFilterStatus: (status) => set({ filterStatus: status })
}));
