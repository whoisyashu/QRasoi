import { DEFAULT_THRESHOLDS } from './config/thresholds.js';
import { getOwnerAuthToken, getChefAuthToken, getAdminAuthToken } from './utils/auth.js';
import { runCustomerScenario } from './scenarios/customer_scenario.js';
import { runOwnerScenario } from './scenarios/owner_scenario.js';
import { runChefScenario } from './scenarios/chef_scenario.js';
import { runAdminScenario } from './scenarios/admin_scenario.js';

export const options = {
  scenarios: {
    integrated_restaurant_day: {
      executor: 'ramping-vus',
      startVUs: 2,
      stages: [
        { duration: '20s', target: 10 },
        { duration: '40s', target: 30 },
        { duration: '20s', target: 0 },
      ],
      gracefulRampDown: '5s',
    },
  },
  thresholds: DEFAULT_THRESHOLDS,
};

export function setup() {
  const ownerToken = getOwnerAuthToken();
  const chefToken = getChefAuthToken();
  const adminToken = getAdminAuthToken();
  return { ownerToken, chefToken, adminToken };
}

export default function (data) {
  // Step 1: Customer browses menu & places order
  const createdOrderId = runCustomerScenario();

  // Step 2: Owner processes orders & payment verification
  if (__VU % 2 === 0) {
    runOwnerScenario(data.ownerToken, createdOrderId);
  }

  // Step 3: Chef processes kitchen KDS queue
  if (__VU % 3 === 0) {
    runChefScenario(data.chefToken, createdOrderId);
  }

  // Step 4: Admin manages tenant portfolio
  if (__VU % 5 === 0) {
    runAdminScenario(data.adminToken);
  }
}
