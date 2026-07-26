import { DEFAULT_THRESHOLDS } from '../config/thresholds.js';
import { getOwnerAuthToken, getChefAuthToken, getAdminAuthToken } from '../utils/auth.js';
import { runCustomerScenario } from '../scenarios/customer_scenario.js';
import { runOwnerScenario } from '../scenarios/owner_scenario.js';
import { runChefScenario } from '../scenarios/chef_scenario.js';
import { runAdminScenario } from '../scenarios/admin_scenario.js';

export const options = {
  scenarios: {
    peak_hours_simulation: {
      executor: 'ramping-vus',
      startVUs: 10,
      stages: [
        { duration: '30s', target: 50 },
        { duration: '1m', target: 100 },
        { duration: '30s', target: 100 },
        { duration: '30s', target: 0 },
      ],
      gracefulRampDown: '10s',
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
  const orderId = runCustomerScenario();

  if (__VU % 5 === 0) {
    runAdminScenario(data.adminToken);
  } else if (__VU % 2 === 0) {
    runOwnerScenario(data.ownerToken, orderId);
  } else {
    runChefScenario(data.chefToken, orderId);
  }
}
