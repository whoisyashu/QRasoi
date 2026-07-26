import { create } from 'zustand';
import { Order, OrderStatus } from '../types';
import { INITIAL_MOCK_ORDERS, MOCK_RESTAURANT } from '../constants/mockData';
import { generateOrderId } from '../utils/formatters';
import { orderService } from '../services/orderService';
import { isSupabaseConfigured } from '../services/supabase';
import { apiClient } from '../services/api';
import { triggerNotification } from '../utils/notificationSound';

import { socketClient } from '../services/socket';

let previousOrderIds: Set<string> | null = null;

interface OrderState {
  orders: Order[];
  isLoading: boolean;
  fetchLiveOrders: () => Promise<void>;
  fetchPublicOrder: (orderId: string) => Promise<Order | null>;
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

        // Detect newly arrived orders for sound notification
        if (previousOrderIds !== null) {
          const brandNewOrders = mappedOrders.filter((o) => !previousOrderIds!.has(o.id));
          if (brandNewOrders.length > 0) {
            const latest = brandNewOrders[0];
            triggerNotification(
              '🔔 New Order Received!',
              `Order ${latest.id} placed at ${latest.tableNumber} by ${latest.customerName}`
            );
          }
        }
        previousOrderIds = new Set(mappedOrders.map((o) => o.id));

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

  fetchPublicOrder: async (orderId: string) => {
    if (!orderId) return null;
    const cleanId = orderId.trim();
    const rawId = cleanId.startsWith('QR-') ? cleanId : `QR-${cleanId}`;

    try {
      const response = await apiClient.get(`/public/orders/${rawId}`);
      if (response.data && response.data.id) {
        const liveOrder: Order = {
          id: response.data.id,
          customerName: response.data.customerName || 'Customer',
          customerPhone: response.data.customerPhone || '',
          tableNumber: response.data.tableNumber || 'Table 1',
          subtotal: Number(response.data.subtotal || 0),
          tax: Number(response.data.tax || 0),
          total: Number(response.data.total || response.data.subtotal || 0),
          status: (response.data.status as OrderStatus) || 'pending',
          isPaymentVerified: Boolean(response.data.isPaymentVerified),
          createdAt: response.data.createdAt || new Date().toISOString(),
          estimatedTimeMinutes: Number(response.data.estimatedTimeMinutes || 15),
          restaurantId: response.data.restaurantId || MOCK_RESTAURANT.id,
          restaurantName: response.data.restaurantName || MOCK_RESTAURANT.name,
          items: response.data.items || [],
        };

        set((state) => {
          const exists = state.orders.some((o) => o.id.toUpperCase() === liveOrder.id.toUpperCase());
          const updated = exists
            ? state.orders.map((o) => (o.id.toUpperCase() === liveOrder.id.toUpperCase() ? liveOrder : o))
            : [liveOrder, ...state.orders];
          return { orders: updated };
        });

        return liveOrder;
      }
    } catch (err) {
      console.warn('Public order fetch error:', err);
    }
    return null;
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
      orders: state.orders.map((o) => {
        if (o.id !== orderId) return o;
        const updatedItems = o.items.map((i) => (i.id === itemId ? { ...i, status } : i));
        const allReady = updatedItems.every((i) => i.status === 'ready');
        return {
          ...o,
          items: updatedItems,
          status: allReady ? ('ready' as OrderStatus) : o.status,
        };
      }),
    }));

    try {
      await apiClient.patch(`/chef/orders/${orderId}/items/${itemId}/status`, { status });
    } catch (err) {
      console.warn('API item status update error:', err);
    }
  },

  cancelOrder: async (orderId) => {
    set((state) => ({
      orders: state.orders.filter((o) => o.id !== orderId),
    }));

    try {
      await apiClient.patch(`/owner/orders/${orderId}/cancel`);
    } catch (err) {
      console.warn('API order cancellation error:', err);
    }
  },

  getOrderById: (orderId) => {
    const rawId = orderId ? (orderId.startsWith('QR-') ? orderId : `QR-${orderId}`) : '';
    return get().orders.find((o) => o.id.toUpperCase() === rawId.toUpperCase() || o.id.toUpperCase() === orderId.toUpperCase());
  },

  checkExpiredOrders: () => {
    const now = Date.now();
    const { orders } = get();
    orders.forEach((o) => {
      if (o.status === 'pending' && !o.isPaymentVerified) {
        const createdTime = new Date(o.createdAt).getTime();
        const timeoutMs = (o.estimatedTimeMinutes || 15) * 60 * 1000;
        if (now - createdTime > timeoutMs) {
          get().cancelOrder(o.id);
        }
      }
    });
  },

  initRealtimeSubscription: () => {
    const socket = socketClient.connect();

    // Listen for real-time order creation (Owner & Kitchen)
    socket.on('order:created', (newOrder: any) => {
      if (newOrder && newOrder.id) {
        set((state) => {
          const exists = state.orders.some((o) => o.id === newOrder.id);
          if (exists) return state;
          triggerNotification(
            '🔔 New Order Received!',
            `Order ${newOrder.id} placed at ${newOrder.tableNumber} by ${newOrder.customerName}`
          );
          return { orders: [newOrder, ...state.orders] };
        });
      }
    });

    // Listen for payment verification (Kitchen KDS & Customer Order Page)
    socket.on('order:payment_verified', (payload: any) => {
      if (payload && payload.id) {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === payload.id ? { ...o, isPaymentVerified: true, status: 'preparing' } : o
          ),
        }));
      }
    });

    // Listen for item status changes (Kitchen KDS & Customer Order Page)
    socket.on('order_item:status_updated', (payload: any) => {
      if (payload && payload.orderId && payload.itemId) {
        set((state) => ({
          orders: state.orders.map((o) => {
            if (o.id !== payload.orderId) return o;
            const updatedItems = o.items.map((i) =>
              i.id === payload.itemId ? { ...i, status: payload.status } : i
            );
            return {
              ...o,
              items: updatedItems,
              status: payload.isOrderReady ? 'ready' : o.status,
            };
          }),
        }));
      }
    });

    // Listen for overall order status changes
    socket.on('order:status_updated', (payload: any) => {
      if (payload && payload.orderId) {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === payload.orderId ? { ...o, status: payload.status } : o
          ),
        }));
      }
    });

    if (isSupabaseConfigured) {
      orderService.subscribeToLiveOrders((payload: any) => {
        if (payload.eventType === 'INSERT') {
          const newOrder = payload.new;
          set((state) => ({
            orders: [newOrder, ...state.orders.filter((o) => o.id !== newOrder.id)],
          }));
        } else if (payload.eventType === 'UPDATE') {
          const updatedOrder = payload.new;
          set((state) => ({
            orders: state.orders.map((o) => (o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o)),
          }));
        }
      });
    }
  },
}));
