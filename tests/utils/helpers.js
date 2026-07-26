import { Trend, Counter } from 'k6/metrics';

// Custom k6 Performance Metrics
export const publicMenuTrend = new Trend('public_menu_latency');
export const orderPlacementTrend = new Trend('order_placement_latency');
export const paymentVerifyTrend = new Trend('payment_verify_latency');
export const kitchenQueueTrend = new Trend('kitchen_queue_latency');
export const cacheHitsCounter = new Counter('cache_hits_total');

/**
 * Generate authorization parameters header with Bearer JWT token
 */
export function getAuthHeaders(token) {
  return {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  };
}

/**
 * Generate random customer details for order simulation
 */
export function getRandomCustomer() {
  const names = ['Aarav Sharma', 'Priya Patel', 'Rahul Verma', 'Sneha Gupta', 'Vikram Singh', 'Ananya Roy', 'Rohan Mehta'];
  const name = names[Math.floor(Math.random() * names.length)];
  const phone = `9${Math.floor(100000000 + Math.random() * 900000000)}`;
  const tableNumber = `Table ${Math.floor(Math.random() * 10) + 1}`;

  return { name, phone, tableNumber };
}

/**
 * Generate random dish items array
 */
export function getRandomOrderItems() {
  const possibleItems = [
    { id: 'item-1', name: 'Paneer Tikka', price: 140, quantity: 1 },
    { id: 'item-2', name: 'Butter Garlic Naan', price: 30, quantity: 2 },
    { id: 'item-3', name: 'Crispy Chilli Baby Corn', price: 80, quantity: 1 },
    { id: 'item-4', name: 'Dal Makhani', price: 160, quantity: 1 },
  ];

  const selected = possibleItems.slice(0, Math.floor(Math.random() * 3) + 1);
  const subtotal = selected.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return { items: selected, subtotal };
}
