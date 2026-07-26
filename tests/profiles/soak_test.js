import { DEFAULT_THRESHOLDS } from '../config/thresholds.js';
import { getOwnerAuthToken, getChefAuthToken } from '../utils/auth.js';
import { runCustomerScenario } from '../scenarios/customer_scenario.js';
import { runOwnerScenario } from '../scenarios/owner_scenario.js';
import { runChefScenario } from '../scenarios/chef_scenario.js';

export const options = {
  scenarios: {
    soak_test_simulation: {
      executor: 'constant-vus',
      vus: 20,
      duration: '5m',
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
  const orderId = runCustomerScenario();

  if (__VU % 2 === 0) {
    runOwnerScenario(data.ownerToken, orderId);
  } else {
    runChefScenario(data.chefToken, orderId);
  }
}
