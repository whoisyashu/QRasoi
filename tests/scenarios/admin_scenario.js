import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL } from '../config/env.js';
import { getAuthHeaders } from '../utils/helpers.js';

/**
 * Super Admin Management Scenario
 * 1. Fetch Multi-Tenant Restaurants Portfolio (`GET /api/admin/tenants`)
 * 2. Verify Restaurant Subscription Activation (`POST /api/admin/verify-tenant`)
 */
export function runAdminScenario(adminToken) {
  if (!adminToken) return;

  const authHeaders = getAuthHeaders(adminToken);

  // Step 1: Fetch Admin Tenants Portfolio
  const tenantsRes = http.get(`${BASE_URL}/admin/tenants`, authHeaders);
  const tenantsSuccess = check(tenantsRes, {
    'Admin tenants fetch status is 200': (r) => r.status === 200,
    'Admin tenants response is array': (r) => r.json() && Array.isArray(r.json()),
  });

  sleep(1);

  // Step 2: Verify Tenant Activation
  if (tenantsSuccess && tenantsRes.json() && tenantsRes.json().length > 0) {
    const targetTenant = tenantsRes.json()[0];
    const verifyPayload = JSON.stringify({
      tenantId: targetTenant.id || targetTenant.slug,
      verifyStatus: 'verified',
    });

    const verifyRes = http.post(`${BASE_URL}/admin/verify-tenant`, verifyPayload, authHeaders);
    check(verifyRes, {
      'Admin tenant verification is 200': (r) => r.status === 200,
    });
  }
}
