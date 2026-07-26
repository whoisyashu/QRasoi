import { create } from 'zustand';
import { Order, OrderStatus } from '../types';
import { INITIAL_MOCK_ORDERS, MOCK_RESTAURANT } from '../constants/mockData';
import { generateOrderId } from '../utils/formatters';
import { orderService } from '../services/orderService';
import { isSupabaseConfigured } from '../services/supabase';
import { apiClient } from '../services/api';

interface OrderState {
  orders: Order[];
  isLoading: boolean;
  fetchLiveOrders: () => Promise<void>;
  createOrder: (data: {
    customerName: string;
    customerPhone: string;
    tableNumber: string;
    items: Order['items'];
    subtotal: number;
    restaurantSlug?: string;
  }) => Promise<Order>;
  verifyPayment: (orderId: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  updateOrderItemStatus: (orderId: string, itemId: string, status: 'preparing' | 'ready') => Promise<void>;
  cancelOrder: (orderId: string) => Promise<void>;
  getOrderById: (orderId: string) => Order | undefined;
  checkExpiredOrders: () => void;
  initRealtimeSubscription: () => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: INITIAL_MOCK_ORDERS,
  isLoading: false,

  fetchLiveOrders: async () => {
    set({ isLoading: true });
    try {
      let response: any;
      try {
        response = await apiClient.get('/owner/orders');
      } catch (err: any) {
        if (err?.response?.status === 403 || err?.response?.status === 401) {
          response = await apiClient.get('/chef/queue');
        } else {
          throw err;
        }
      }

      if (Array.isArray(response.data) && response.data.length > 0) {
        const mappedOrders: Order[] = response.data.map((row: any) => ({
          id: row.id,
          customerName: row.customer_name || row.customerName || 'Customer',
          customerPhone: row.customer_phone || row.customerPhone || '',
          tableNumber: row.table_number || row.tableNumber || 'Table 1',
          subtotal: Number(row.subtotal || 0),
          tax: Number(row.tax || 0),
          total: Number(row.total || row.subtotal || 0),
          status: (row.status as OrderStatus) || 'pending',
          isPaymentVerified: Boolean(row.is_payment_verified || row.isPaymentVerified),
          createdAt: row.created_at || row.createdAt || new Date().toISOString(),
          estimatedTimeMinutes: Number(row.estimated_time_minutes || 15),
          restaurantId: row.restaurant_id || MOCK_RESTAURANT.id,
          restaurantName: MOCK_RESTAURANT.name,
          items: (row.order_items || row.items || []).map((oi: any) => ({
            id: oi.id || `oi-${oi.menu_item_id || oi.menuItem?.id || 'item'}`,
            menuItem: {
              id: oi.menu_item_id || oi.menuItem?.id || 'item-1',
              name: oi.item_name || oi.menuItem?.name || 'Dish',
              description: '',
              price: Number(oi.item_price || oi.price || oi.menuItem?.price || 0),
              category: 'Main Course',
              dietary: 'veg',
              isAvailable: true,
              preparationTimeMinutes: 15,
            },
            quantity: oi.quantity || 1,
            notes: oi.cooking_notes || oi.notes || '',
            status: oi.status || 'preparing',
          })),
        }));

        set({ orders: mappedOrders, isLoading: false });
        return;
      }
    } catch (err) {
      console.warn('API order fetch error, checking Supabase direct:', err);
    }

    if (isSupabaseConfigured) {
      const liveOrders = await orderService.fetchOrders();
      if (liveOrders.length > 0) {
        set({ orders: liveOrders, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }
  },

  createOrder: async (data) => {
    const newOrder: Order = {
      id: generateOrderId(),
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      tableNumber: data.tableNumber,
      items: data.items.map((i) => ({ ...i, status: 'preparing' })),
      subtotal: data.subtotal,
      tax: 0,
      total: data.subtotal,
      status: 'pending',
      isPaymentVerified: false,
      createdAt: new Date().toISOString(),
      estimatedTimeMinutes: 15,
      restaurantId: MOCK_RESTAURANT.id,
      restaurantName: MOCK_RESTAURANT.name,
    };

    set((state) => ({ orders: [newOrder, ...state.orders] }));

    try {
      const response = await apiClient.post('/public/orders', {
        restaurantSlug: data.restaurantSlug || MOCK_RESTAURANT.slug,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        tableNumber: data.tableNumber,
        items: data.items,
        subtotal: data.subtotal,
      });

      if (response.data && response.data.orderId) {
        newOrder.id = response.data.orderId;
        set((state) => ({
          orders: state.orders.map((o) => (o.createdAt === newOrder.createdAt ? { ...o, id: response.data.orderId } : o)),
        }));
      }
    } catch (err) {
      console.warn('Public API order insert error, fallback to direct Supabase:', err);
      if (isSupabaseConfigured) {
        await orderService.createOrder(newOrder);
      }
    }

    return newOrder;
  },

  verifyPayment: async (orderId) => {
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId
          ? { ...o, isPaymentVerified: true, status: 'preparing' as OrderStatus }
          : o
      ),
    }));

    try {
      await apiClient.patch(`/owner/orders/${orderId}/verify-payment`);
    } catch (err) {
      console.warn('API verify payment error, fallback to direct Supabase:', err);
      if (isSupabaseConfigured) {
        await orderService.updateOrderStatus(orderId, 'preparing', true);
      }
    }
  },

  updateOrderStatus: async (orderId, status) => {
    set((state) => ({
      orders: state.orders.map((o) => {
        if (o.id !== orderId) return o;
        const updatedItems = (status === 'ready' || status === 'completed')
          ? o.items.map((i) => ({ ...i, status: 'ready' as const }))
          : o.items;
        return { ...o, status, items: updatedItems };
      }),
    }));

    try {
      await apiClient.patch(`/chef/orders/${orderId}/status`, { status });
    } catch (err) {
      console.warn('API status update error:', err);
      if (isSupabaseConfigured) {
        await orderService.updateOrderStatus(orderId, status);
      }
    }
  },

  updateOrderItemStatus: async (orderId, itemId, status) => {
    set((state) => ({
      orders: state.orders.map((order) => {
        if (order.id !== orderId) return order;

        const updatedItems = order.items.map((item) => {
          if (item.id === itemId || item.menuItem.id === itemId) {
            return { ...item, status };
          }
          return item;
        });

        const allItemsReady = updatedItems.length > 0 && updatedItems.every((item) => item.status === 'ready');
        const newOrderStatus = allItemsReady ? ('ready' as OrderStatus) : order.status;

        return {
          ...order,
          items: updatedItems,
          status: newOrderStatus,
        };
      }),
    }));

    try {
      await apiClient.patch(`/chef/order-items/${itemId}/status`, { orderId, status });
    } catch (err) {
      console.warn('API order item status update error:', err);
    }
  },

  cancelOrder: async (orderId) => {
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId ? { ...o, status: 'cancelled' as OrderStatus } : o
      ),
    }));

    if (isSupabaseConfigured) {
      await orderService.updateOrderStatus(orderId, 'cancelled');
    }
  },

  getOrderById: (orderId) => {
    const cleanId = orderId.startsWith('QR-') ? orderId : `QR-${orderId}`;
    return get().orders.find((o) => o.id === cleanId || o.id === orderId);
  },

  checkExpiredOrders: () => {
    const timeoutMs = MOCK_RESTAURANT.orderTimeoutMinutes * 60 * 1000;
    const now = Date.now();
    set((state) => ({
      orders: state.orders.map((order) => {
        if (
          order.status === 'pending' &&
          !order.isPaymentVerified &&
          now - new Date(order.createdAt).getTime() > timeoutMs
        ) {
          return { ...order, status: 'expired' as OrderStatus };
        }
        return order;
      }),
    }));
  },

  initRealtimeSubscription: () => {
    if (!isSupabaseConfigured) return;
    orderService.subscribeToLiveOrders(() => {
      get().fetchLiveOrders();
    });
  },
}));
