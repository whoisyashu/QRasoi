import http from 'k6/http';
import { check } from 'k6';
import { BASE_URL, TEST_OWNER_CREDENTIALS, TEST_CHEF_CREDENTIALS } from '../config/env.js';

export const options = {
  scenarios: {
    authentication_burst_simulation: {
      executor: 'per-vu-iterations',
      vus: 30,
      iterations: 3,
      maxDuration: '45s',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<800'],
  },
};

export default function () {
  const isOwner = __VU % 2 === 0;
  const url = isOwner ? `${BASE_URL}/auth/login` : `${BASE_URL}/auth/login-chef`;
  const email = isOwner ? TEST_OWNER_CREDENTIALS.email : TEST_CHEF_CREDENTIALS.email;
  const password = isOwner ? TEST_OWNER_CREDENTIALS.password : TEST_CHEF_CREDENTIALS.password;

  const payload = JSON.stringify({ email, password });
  const params = { headers: { 'Content-Type': 'application/json' } };

  const res = http.post(url, payload, params);

  check(res, {
    'Login burst status is 200': (r) => r.status === 200,
    'Login returned valid token': (r) => r.json() && r.json().token !== undefined,
  });
}
