export type DietaryType = 'veg' | 'non-veg' | 'egg';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  dietary: DietaryType;
  image?: string;
  isAvailable: boolean;
  isPopular?: boolean;
  preparationTimeMinutes: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface CartItem {
  id?: string; // Unique order item ID
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
  name?: string; // Fallback helper
  status?: 'preparing' | 'ready'; // Item-level kitchen status
}

export type OrderItem = CartItem;

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled' | 'expired';

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  tableNumber: string;
  customer?: string;
  table?: string;
  revenue?: number;
  ordersCount?: number;
  value?: number;
  color?: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: OrderStatus;
  isPaymentVerified: boolean;
  createdAt: string; // ISO string
  estimatedTimeMinutes: number;
  restaurantId: string;
  restaurantName: string;
  restaurantAddress?: string;
  restaurantPhone?: string;
}

export interface RestaurantProfile {
  id: string;
  slug?: string;
  name: string;
  tagline: string;
  address: string;
  phone: string;
  cuisine: string;
  openingHours: string;
  logo: string;
  coverImage: string;
  orderTimeoutMinutes: number;
  qrCodeUrl: string;
}

export type UserRole = 'customer' | 'owner' | 'chef' | 'admin';

export interface AnalyticsMetric {
  date: string;
  revenue: number;
  ordersCount: number;
}

export interface TopSellingItem {
  id: string;
  name: string;
  category: string;
  ordersCount: number;
  totalRevenue: number;
}
