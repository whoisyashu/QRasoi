import { Category, MenuItem, Order, RestaurantProfile } from '../types';

export const MOCK_RESTAURANT: RestaurantProfile = {
  id: 'rest-dineverse-bistro-q4zpbu',
  name: 'DineVerse Bistro',
  tagline: 'Digital Menu & QR Ordering',
  address: 'Flat No.13A, Bankey Bihari Enclave',
  phone: '+91 9368967944',
  cuisine: 'Multi-Cuisine',
  openingHours: '10:00 AM - 11:00 PM',
  logo: '/logo.png',
  coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80',
  orderTimeoutMinutes: 15,
  qrCodeUrl: 'https://qrasoi.app/r/dineverse-bistro',
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
