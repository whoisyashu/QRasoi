import { DEFAULT_THRESHOLDS } from '../config/thresholds.js';
import { getOwnerAuthToken, getChefAuthToken, getAdminAuthToken } from '../utils/auth.js';
import { runChainedRestaurantWorkflow } from '../scenarios/mixed_restaurant_workflow.js';

/**
 * Traffic Spike & Recovery Profile
 * Ramping stages: 5 VUs -> 15 VUs -> 30 VUs -> 60 VUs (Spike Peak) -> 30 VUs -> 15 VUs -> 5 VUs (Recovery)
 * Validates backend resilience, socket connection stability, and recovery speed back to baseline latency.
 */
export const options = {
  scenarios: {
    spike_recovery_simulation: {
      executor: 'ramping-vus',
      startVUs: 5,
      stages: [
        { duration: '15s', target: 5 },   // Step 1: Baseline 5 VUs
        { duration: '15s', target: 15 },  // Step 2: Ramp to 15 VUs
        { duration: '20s', target: 30 },  // Step 3: Ramp to 30 VUs
        { duration: '30s', target: 60 },  // Step 4: SPIKE PEAK 60 VUs
        { duration: '20s', target: 30 },  // Step 5: Ramp down to 30 VUs
        { duration: '15s', target: 15 },  // Step 6: Ramp down to 15 VUs
        { duration: '15s', target: 5 },   // Step 7: RECOVERY 5 VUs (Verify baseline latency return)
        { duration: '10s', target: 0 },
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
  runChainedRestaurantWorkflow(data.ownerToken, data.chefToken, data.adminToken);
}
