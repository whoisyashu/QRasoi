import { create } from 'zustand';
import { Order } from '../types';
import { apiClient } from '../services/api.service';

interface OrderState {
  orders: Order[];
  isLoading: boolean;
  filterStatus: string;
  fetchLiveOrders: (restaurantId: string) => Promise<void>;
  updateOrderItemStatus: (orderId: string, itemId: string, status: string) => Promise<void>;
  toggleItemReady: (orderId: string, itemIndex: number) => Promise<void>;
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
      const serverOrders: Order[] = res.data?.data || res.data || [];
      get().mergeServerOrders(serverOrders);
    } catch (e) {
      console.warn('Failed to fetch orders:', e);
    } finally {
      set({ isLoading: false });
    }
  },

  mergeServerOrders: (serverOrders: Order[]) => {
    const existingOrders = get().orders;
    const merged = serverOrders.map((serverOrder) => {
      const existingOrder = existingOrders.find((o) => o.id === serverOrder.id);
      if (!existingOrder) return serverOrder;

      const mergedItems = (serverOrder.items || []).map((serverItem, idx) => {
        const existingItem = existingOrder.items?.[idx];
        const isLocalReady = existingItem?.status === 'ready' || existingItem?.is_ready;
        if (isLocalReady) {
          return {
            ...serverItem,
            status: 'ready' as const,
            is_ready: true,
          };
        }
        return serverItem;
      });

      return { ...serverOrder, items: mergedItems };
    });

    set({ orders: merged });
  },

  toggleItemReady: async (orderId: string, itemIndex: number) => {
    set((state) => ({
      orders: state.orders.map((o) => {
        if (o.id !== orderId) return o;
        const updatedItems = (o.items || []).map((item, idx) => {
          if (idx !== itemIndex) return item;
          const nextReady = !item.is_ready;
          return {
            ...item,
            is_ready: nextReady,
            status: nextReady ? ('ready' as const) : ('preparing' as const),
          };
        });
        return { ...o, items: updatedItems };
      }),
    }));
  },

  updateOrderItemStatus: async (orderId, itemId, status) => {
    set((state) => ({
      orders: state.orders.map((o) => {
        if (o.id !== orderId) return o;
        return {
          ...o,
          items: (o.items || []).map((i) => (i.id === itemId ? { ...i, status: status as any } : i))
        };
      })
    }));

    try {
      await apiClient.patch(`/chef/orders/${orderId}/items/${itemId}/status`, { status });
    } catch (e) {}
  },

  cancelOrder: async (orderId) => {
    try {
      await apiClient.patch(`/owner/orders/${orderId}/cancel`);
    } catch (e) {}
    set((state) => ({
      orders: state.orders.map((o) => (o.id === orderId ? { ...o, status: 'cancelled' } : o))
    }));
  },

  setFilterStatus: (status) => set({ filterStatus: status })
}));
