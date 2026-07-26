import { supabase, isSupabaseConfigured } from './supabase';
import { Order, OrderStatus } from '../types';

export const orderService = {
  /**
   * Fetch all orders from PostgreSQL Supabase
   */
  async fetchOrders(): Promise<Order[]> {
    if (!isSupabaseConfigured || !supabase) return [];
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map((row: any) => ({
        id: row.id,
        customerName: row.customer_name,
        customerPhone: row.customer_phone,
        tableNumber: row.table_number,
        subtotal: Number(row.subtotal),
        tax: Number(row.tax || 0),
        total: Number(row.total),
        status: row.status as OrderStatus,
        isPaymentVerified: Boolean(row.is_payment_verified),
        createdAt: row.created_at,
        estimatedTimeMinutes: Number(row.estimated_time_minutes || 15),
        restaurantId: row.restaurant_id,
        restaurantName: 'Royal Dhaba & Cafe',
        items: (row.order_items || []).map((oi: any) => ({
          menuItem: {
            id: oi.menu_item_id || 'item-1',
            name: oi.item_name,
            description: '',
            price: Number(oi.item_price),
            category: 'Main Course',
            dietary: 'veg',
            image: '',
            isAvailable: true,
            preparationTimeMinutes: 15,
          },
          quantity: oi.quantity,
          notes: oi.cooking_notes,
        })),
      }));
    } catch (err) {
      console.warn('Error fetching orders from Supabase:', err);
      return [];
    }
  },

  /**
   * Save a new order to Supabase
   */
  async createOrder(order: Order): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      const { error: orderErr } = await supabase.from('orders').insert({
        id: order.id,
        restaurant_id: order.restaurantId,
        customer_name: order.customerName,
        customer_phone: order.customerPhone,
        table_number: order.tableNumber,
        subtotal: order.subtotal,
        tax: order.tax,
        total: order.total,
        status: order.status,
        is_payment_verified: order.isPaymentVerified,
        estimated_time_minutes: order.estimatedTimeMinutes,
        created_at: order.createdAt,
      });

      if (orderErr) throw orderErr;

      const orderItems = order.items.map((item) => ({
        order_id: order.id,
        menu_item_id: item.menuItem.id.startsWith('item-') ? null : item.menuItem.id,
        item_name: item.menuItem.name,
        item_price: item.menuItem.price,
        quantity: item.quantity,
        cooking_notes: item.notes || null,
      }));

      const { error: itemsErr } = await supabase.from('order_items').insert(orderItems);
      if (itemsErr) throw itemsErr;

      return true;
    } catch (err) {
      console.warn('Error inserting order to Supabase:', err);
      return false;
    }
  },

  /**
   * Update order status in Supabase
   */
  async updateOrderStatus(orderId: string, status: OrderStatus, isPaymentVerified = false): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      const updates: any = { status };
      if (isPaymentVerified) updates.is_payment_verified = true;

      const { error } = await supabase.from('orders').update(updates).eq('id', orderId);
      if (error) throw error;
      return true;
    } catch (err) {
      console.warn('Error updating order status in Supabase:', err);
      return false;
    }
  },

  /**
   * Subscribe to real-time order updates via Supabase WebSockets
   */
  subscribeToLiveOrders(onOrderChanged: (payload: any) => void) {
    if (!isSupabaseConfigured || !supabase) return null;
    return supabase
      .channel('public:orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        onOrderChanged(payload);
      })
      .subscribe();
  },
};
