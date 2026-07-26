import { Category, MenuItem, Order, RestaurantProfile } from '../types';

export const MOCK_RESTAURANT: RestaurantProfile = {
  id: 'rest-new-outlet',
  name: 'Your Restaurant Name',
  tagline: 'Digital Menu & QR Ordering',
  address: 'Update address in Settings',
  phone: '+91 90000 00000',
  cuisine: 'Multi-Cuisine',
  openingHours: '10:00 AM - 11:00 PM',
  logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80',
  coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80',
  orderTimeoutMinutes: 15,
  qrCodeUrl: 'https://qrasoi.app/r/new-outlet',
};

export const MOCK_CATEGORIES: Category[] = [
  { id: 'cat-all', name: 'All Items', icon: 'Utensils' },
];

export const MOCK_MENU_ITEMS: MenuItem[] = [];

export const INITIAL_MOCK_ORDERS: Order[] = [];

export const MOCK_ANALYTICS_DATA = {
  dailyRevenue: [],
  topDishes: [],
  categoryShare: [],
};
