import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, DEFAULT_RESTAURANT_SLUG } from '../config/env.js';
import { publicMenuTrend, orderPlacementTrend, getRandomCustomer, getRandomOrderItems } from '../utils/helpers.js';

/**
 * Customer End-to-End Workflow Scenario
 * 1. Browse Public Digital Menu (Validates in-memory TTL Cache <5ms response time)
 * 2. Place Customer Food Order (Captures generated Order ID)
 * 3. Track Live Order Status
 */
export function runCustomerScenario() {
  // Step 1: Browse Public Menu
  const menuRes = http.get(`${BASE_URL}/public/r/${DEFAULT_RESTAURANT_SLUG}`);
  publicMenuTrend.add(menuRes.timings.duration);

  check(menuRes, {
    'Customer menu fetch status is 200': (r) => r.status === 200,
    'Customer menu response has restaurant profile': (r) => r.json() && r.json().restaurant !== undefined,
    'Customer menu response has items': (r) => r.json() && Array.isArray(r.json().items),
  });

  sleep(1);

  // Step 2: Place Order
  const customer = getRandomCustomer();
  const orderDetails = getRandomOrderItems();

  const orderPayload = JSON.stringify({
    restaurantSlug: DEFAULT_RESTAURANT_SLUG,
    customerName: customer.name,
    customerPhone: customer.phone,
    tableNumber: customer.tableNumber,
    items: orderDetails.items,
    subtotal: orderDetails.subtotal,
  });

  const orderParams = {
    headers: { 'Content-Type': 'application/json' },
  };

  const orderRes = http.post(`${BASE_URL}/public/orders`, orderPayload, orderParams);
  orderPlacementTrend.add(orderRes.timings.duration);

  const orderSuccess = check(orderRes, {
    'Order placement status is 201': (r) => r.status === 201,
    'Order ID returned': (r) => r.json() && r.json().orderId !== undefined,
  });

  let createdOrderId = null;
  if (orderSuccess && orderRes.json() && orderRes.json().orderId) {
    createdOrderId = orderRes.json().orderId;
  }

  sleep(2);

  // Step 3: Track Order Status (if order created successfully)
  if (createdOrderId) {
    const statusRes = http.get(`${BASE_URL}/public/orders/${createdOrderId}`);
    check(statusRes, {
      'Order status tracking is 200': (r) => r.status === 200,
      'Order status matches created ID': (r) => r.json() && r.json().id === createdOrderId,
    });
  }

  return createdOrderId;
}
