import http from 'k6/http';
import { check } from 'k6';
import { BASE_URL, TEST_OWNER_CREDENTIALS, TEST_CHEF_CREDENTIALS, TEST_ADMIN_CREDENTIALS } from '../config/env.js';

/**
 * Authenticate Restaurant Owner and obtain Bearer JWT token
 */
export function getOwnerAuthToken() {
  const payload = JSON.stringify({
    email: TEST_OWNER_CREDENTIALS.email,
    password: TEST_OWNER_CREDENTIALS.password,
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const res = http.post(`${BASE_URL}/auth/login`, payload, params);

  const success = check(res, {
    'Owner auth status is 200': (r) => r.status === 200,
    'Owner auth token present': (r) => r.json() && r.json().token !== undefined,
  });

  if (!success) {
    return null;
  }

  return res.json().token;
}

/**
 * Authenticate Chef and obtain Bearer JWT token
 */
export function getChefAuthToken() {
  const payload = JSON.stringify({
    email: TEST_CHEF_CREDENTIALS.email,
    password: TEST_CHEF_CREDENTIALS.password,
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const res = http.post(`${BASE_URL}/auth/login-chef`, payload, params);

  const success = check(res, {
    'Chef auth status is 200': (r) => r.status === 200,
    'Chef auth token present': (r) => r.json() && r.json().token !== undefined,
  });

  if (!success) {
    return null;
  }

  return res.json().token;
}

/**
 * Authenticate Platform Admin (Step 1 + Step 2 2FA) and obtain Bearer JWT token
 */
export function getAdminAuthToken() {
  const step1Payload = JSON.stringify({
    email: TEST_ADMIN_CREDENTIALS.email,
    password: TEST_ADMIN_CREDENTIALS.password,
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const res1 = http.post(`${BASE_URL}/auth/admin/login-step1`, step1Payload, params);
  if (res1.status !== 200 || !res1.json() || !res1.json().tempToken) {
    return null;
  }

  const tempToken = res1.json().tempToken;

  const step2Payload = JSON.stringify({
    tempToken,
    method: 'totp',
    totpCode: TEST_ADMIN_CREDENTIALS.totpCode,
  });

  const res2 = http.post(`${BASE_URL}/auth/admin/verify-2fa`, step2Payload, params);

  const success = check(res2, {
    'Admin 2FA status is 200': (r) => r.status === 200,
    'Admin auth token present': (r) => r.json() && r.json().token !== undefined,
  });

  if (!success) {
    return null;
  }

  return res2.json().token;
}
