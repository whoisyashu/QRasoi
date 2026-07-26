import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, DEFAULT_RESTAURANT_SLUG } from '../config/env.js';
import { getAuthHeaders, publicMenuTrend, orderPlacementTrend, paymentVerifyTrend, kitchenQueueTrend, getRandomCustomer, getRandomOrderItems } from '../utils/helpers.js';

/**
 * Realistic Restaurant Chained Business Event Workflow:
 * 1. Customer browses menu (70% probability)
 * 2. Customer places order -> captures Order ID
 * 3. Owner receives order & verifies payment using captured Order ID
 * 4. Chef receives payment-verified order in kitchen queue
 * 5. Chef updates item status to 'ready'
 * 6. Customer receives status update & tracks order status
 * 7. Chef marks order completed
 */
export function runChainedRestaurantWorkflow(ownerToken, chefToken, adminToken) {
  const rand = Math.random();

  // 70% of actions: Menu Browsing (Most frequent customer behavior)
  if (rand < 0.70) {
    const menuRes = http.get(`${BASE_URL}/public/r/${DEFAULT_RESTAURANT_SLUG}`);
    publicMenuTrend.add(menuRes.timings.duration);
    check(menuRes, {
      'Public Menu Fetch 200': (r) => r.status === 200,
      'Public Menu Fast (<200ms)': (r) => r.timings.duration < 200,
    });
    sleep(1);
    return;
  }

  // 15% of actions: Full Chained Order Lifecycle (Customer -> Owner -> Chef -> Complete)
  if (rand < 0.85) {
    const customer = getRandomCustomer();
    const orderDetails = getRandomOrderItems();

    // Step A: Customer places order
    const orderPayload = JSON.stringify({
      restaurantSlug: DEFAULT_RESTAURANT_SLUG,
      customerName: customer.name,
      customerPhone: customer.phone,
      tableNumber: customer.tableNumber,
      items: orderDetails.items,
      subtotal: orderDetails.subtotal,
    });

    const orderRes = http.post(`${BASE_URL}/public/orders`, orderPayload, {
      headers: { 'Content-Type': 'application/json' },
    });
    orderPlacementTrend.add(orderRes.timings.duration);

    const orderSuccess = check(orderRes, {
      'Order Placement 201': (r) => r.status === 201,
      'Order ID returned': (r) => r.json() && r.json().orderId !== undefined,
    });

    if (!orderSuccess || !orderRes.json() || !orderRes.json().orderId) {
      sleep(1);
      return;
    }

    const createdOrderId = orderRes.json().orderId;
    sleep(1);

    // Step B: Owner verifies payment if token available
    if (ownerToken) {
      const verifyRes = http.patch(`${BASE_URL}/owner/orders/${createdOrderId}/verify-payment`, null, getAuthHeaders(ownerToken));
      paymentVerifyTrend.add(verifyRes.timings.duration);
      check(verifyRes, {
        'Owner Payment Verification 200': (r) => r.status === 200,
      });
      sleep(1);
    }

    // Step C: Chef views kitchen queue & updates item status if token available
    if (chefToken) {
      const queueRes = http.get(`${BASE_URL}/chef/queue`, getAuthHeaders(chefToken));
      kitchenQueueTrend.add(queueRes.timings.duration);

      const itemPayload = JSON.stringify({ status: 'ready', orderId: createdOrderId });
      http.patch(`${BASE_URL}/chef/order-items/item-1/status`, itemPayload, getAuthHeaders(chefToken));
      sleep(1);

      // Step D: Chef completes order
      const completePayload = JSON.stringify({ status: 'completed' });
      http.patch(`${BASE_URL}/chef/orders/${createdOrderId}/status`, completePayload, getAuthHeaders(chefToken));
      sleep(1);
    }

    // Step E: Customer tracks final status
    http.get(`${BASE_URL}/public/orders/${createdOrderId}`);
    return;
  }

  // 10% of actions: Owner Dashboard Inspection
  if (rand < 0.95 && ownerToken) {
    http.get(`${BASE_URL}/owner/orders`, getAuthHeaders(ownerToken));
    http.get(`${BASE_URL}/owner/menu`, getAuthHeaders(ownerToken));
    sleep(1);
    return;
  }

  // 5% of actions: Admin Operations
  if (adminToken) {
    http.get(`${BASE_URL}/admin/tenants`, getAuthHeaders(adminToken));
    sleep(1);
  }
}
