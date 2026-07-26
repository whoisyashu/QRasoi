import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL } from '../config/env.js';
import { getAuthHeaders, paymentVerifyTrend } from '../utils/helpers.js';

/**
 * Restaurant Owner Workflow Scenario
 * 1. Fetch Live Restaurant Orders (`GET /api/owner/orders`)
 * 2. Verify Payment on Cashier Counter (`PATCH /api/owner/orders/:orderId/verify-payment`)
 * 3. Fetch Owner Digital Menu Items (`GET /api/owner/menu`)
 */
export function runOwnerScenario(ownerToken, targetOrderId = null) {
  if (!ownerToken) return;

  const authHeaders = getAuthHeaders(ownerToken);

  // Step 1: Fetch Live Orders
  const ordersRes = http.get(`${BASE_URL}/owner/orders`, authHeaders);
  const ordersSuccess = check(ordersRes, {
    'Owner orders status is 200': (r) => r.status === 200,
    'Owner orders response is array': (r) => r.json() && Array.isArray(r.json()),
  });

  let pendingOrderId = targetOrderId;
  if (!pendingOrderId && ordersSuccess && ordersRes.json()) {
    const pendingOrders = ordersRes.json().filter((o) => !o.isPaymentVerified);
    if (pendingOrders.length > 0) {
      pendingOrderId = pendingOrders[0].id;
    }
  }

  sleep(1);

  // Step 2: Verify Payment if pending order exists
  if (pendingOrderId) {
    const verifyRes = http.patch(`${BASE_URL}/owner/orders/${pendingOrderId}/verify-payment`, null, authHeaders);
    paymentVerifyTrend.add(verifyRes.timings.duration);

    check(verifyRes, {
      'Payment verification status is 200': (r) => r.status === 200,
      'Order payment marked verified': (r) => r.json() && (r.json().isPaymentVerified === true || r.json().is_payment_verified === true),
    });
  }

  sleep(1);

  // Step 3: Fetch Owner Menu Management View
  const menuRes = http.get(`${BASE_URL}/owner/menu`, authHeaders);
  check(menuRes, {
    'Owner menu fetch status is 200': (r) => r.status === 200,
    'Owner menu response is array': (r) => r.json() && Array.isArray(r.json()),
  });
}
