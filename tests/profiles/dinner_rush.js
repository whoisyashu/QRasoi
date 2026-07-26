import { DEFAULT_THRESHOLDS } from '../config/thresholds.js';
import { getOwnerAuthToken, getChefAuthToken, getAdminAuthToken } from '../utils/auth.js';
import { runChainedRestaurantWorkflow } from '../scenarios/mixed_restaurant_workflow.js';

export const options = {
  scenarios: {
    dinner_rush_simulation: {
      executor: 'ramping-vus',
      startVUs: 10,
      stages: [
        { duration: '30s', target: 30 },
        { duration: '1m', target: 75 },
        { duration: '1m', target: 100 },
        { duration: '30s', target: 30 },
        { duration: '15s', target: 0 },
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
  runChainedRestaurantWorkflow(data.ownerToken, data.chefToken, data.adminToken);
}
