import { DEFAULT_THRESHOLDS } from '../config/thresholds.js';
import { getOwnerAuthToken, getChefAuthToken } from '../utils/auth.js';
import { runCustomerScenario } from '../scenarios/customer_scenario.js';
import { runOwnerScenario } from '../scenarios/owner_scenario.js';
import { runChefScenario } from '../scenarios/chef_scenario.js';

export const options = {
  scenarios: {
    low_traffic_simulation: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages: [
        { duration: '15s', target: 5 },
        { duration: '30s', target: 5 },
        { duration: '15s', target: 0 },
      ],
      gracefulRampDown: '5s',
    },
  },
  thresholds: DEFAULT_THRESHOLDS,
};

export function setup() {
  const ownerToken = getOwnerAuthToken();
  const chefToken = getChefAuthToken();
  return { ownerToken, chefToken };
}

export default function (data) {
  // Simulate concurrent activity between customer, owner, and chef
  const orderId = runCustomerScenario();

  if (__VU % 2 === 0) {
    runOwnerScenario(data.ownerToken, orderId);
  } else {
    runChefScenario(data.chefToken, orderId);
  }
}
