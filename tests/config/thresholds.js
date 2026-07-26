// Thresholds & Performance Service Level Agreements (SLAs) for QRasoi

export const DEFAULT_THRESHOLDS = {
  // Global failure rate must be under 1%
  http_req_failed: ['rate<0.01'],

  // 95% of all requests must complete in under 500ms, 99% in under 1500ms
  http_req_duration: ['p(95)<500', 'p(99)<1500'],

  // Custom Metric SLAs
  'public_menu_latency': ['p(95)<100'],
  'order_placement_latency': ['p(95)<400'],
  'payment_verify_latency': ['p(95)<300'],
};
