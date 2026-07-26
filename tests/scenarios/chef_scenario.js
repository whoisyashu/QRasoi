import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL } from '../config/env.js';
import { getAuthHeaders, kitchenQueueTrend } from '../utils/helpers.js';

/**
 * Kitchen Chef KDS Workflow Scenario
 * 1. Fetch Payment-Verified Orders Queue (`GET /api/chef/queue`)
 * 2. Update Food Item Preparation Status (`PATCH /api/chef/order-items/:itemId/status`)
 * 3. Update Order Overall Status (`PATCH /api/chef/orders/:orderId/status`)
 */
export function runChefScenario(chefToken, targetOrderId = null) {
  if (!chefToken) return;

  const authHeaders = getAuthHeaders(chefToken);

  // Step 1: Fetch Kitchen Queue
  const queueRes = http.get(`${BASE_URL}/chef/queue`, authHeaders);
  kitchenQueueTrend.add(queueRes.timings.duration);

  const queueSuccess = check(queueRes, {
    'Chef KDS queue status is 200': (r) => r.status === 200,
    'Chef KDS queue response is array': (r) => r.json() && Array.isArray(r.json()),
  });

  let activeOrder = null;
  if (queueSuccess && queueRes.json() && queueRes.json().length > 0) {
    activeOrder = queueRes.json()[0];
  }

  sleep(1);

  // Step 2: Update Item Preparation Status
  if (activeOrder && activeOrder.items && activeOrder.items.length > 0) {
    const itemToCook = activeOrder.items[0];
    const itemPayload = JSON.stringify({
      status: 'ready',
      orderId: activeOrder.id,
    });

    const itemRes = http.patch(`${BASE_URL}/chef/order-items/${itemToCook.id}/status`, itemPayload, authHeaders);
    check(itemRes, {
      'Chef item status update is 200': (r) => r.status === 200,
    });
  }

  sleep(1);

  // Step 3: Update Order Overall Status to Completed
  const orderIdToComplete = targetOrderId || (activeOrder ? activeOrder.id : null);
  if (orderIdToComplete) {
    const statusPayload = JSON.stringify({ status: 'completed' });
    const statusRes = http.patch(`${BASE_URL}/chef/orders/${orderIdToComplete}/status`, statusPayload, authHeaders);

    check(statusRes, {
      'Chef order completion status is 200': (r) => r.status === 200,
    });
  }
}
