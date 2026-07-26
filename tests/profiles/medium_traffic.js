import { DEFAULT_THRESHOLDS } from '../config/thresholds.js';
import { getOwnerAuthToken, getChefAuthToken, getAdminAuthToken } from '../utils/auth.js';
import { runCustomerScenario } from '../scenarios/customer_scenario.js';
import { runOwnerScenario } from '../scenarios/owner_scenario.js';
import { runChefScenario } from '../scenarios/chef_scenario.js';
import { runAdminScenario } from '../scenarios/admin_scenario.js';

export const options = {
  scenarios: {
    medium_traffic_simulation: {
      executor: 'ramping-vus',
      startVUs: 5,
      stages: [
        { duration: '20s', target: 15 },
        { duration: '40s', target: 25 },
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
  const orderId = runCustomerScenario();

  if (__VU % 4 === 0) {
    runAdminScenario(data.adminToken);
  } else if (__VU % 2 === 0) {
    runOwnerScenario(data.ownerToken, orderId);
  } else {
    runChefScenario(data.chefToken, orderId);
  }
}
