export type UserRole = 'SUPER_ADMIN' | 'OWNER' | 'CHEF' | 'owner' | 'chef' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  restaurantId?: string;
  createdAt?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  address?: string;
  phone?: string;
  logoUrl?: string;
  isApproved?: boolean;
  createdAt?: string;
}

export interface MenuItem {
  id: string;
  restaurantId?: string;
  categoryId?: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isVeg?: boolean;
  is_veg?: boolean;
  isAvailable?: boolean;
  spiceLevel?: 'MILD' | 'MEDIUM' | 'SPICY';
}

export interface Category {
  id: string;
  restaurantId: string;
  name: string;
  displayOrder: number;
}

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderItem {
  id?: string;
  orderId?: string;
  menuItemId?: string;
  quantity: number;
  notes?: string;
  price?: number;
  name?: string;
  item_name?: string;
  is_ready?: boolean;
  isReady?: boolean;
  status?: 'pending' | 'preparing' | 'ready';
  menuItem?: MenuItem;
}

export interface Order {
  id: string;
  restaurantId?: string;
  order_ref?: string;
  orderRef?: string;
  tableNumber?: string;
  table_number?: string;
  customerName?: string;
  customerPhone?: string;
  status: OrderStatus;
  paymentStatus?: PaymentStatus;
  payment_status?: PaymentStatus;
  paymentMethod?: 'CASH' | 'ONLINE';
  subtotal?: number;
  total?: number;
  total_amount?: number;
  notes?: string;
  isPaymentVerified?: boolean;
  createdAt?: string;
  items: OrderItem[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
