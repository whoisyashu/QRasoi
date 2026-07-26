// Environment Configuration for k6 Performance Tests

export const BASE_URL = __ENV.TARGET_URL || 'https://qrasoi.onrender.com/api';
export const DEFAULT_RESTAURANT_SLUG = __ENV.RESTAURANT_SLUG || 'dineverse-bistro';

export const TEST_OWNER_CREDENTIALS = {
  email: __ENV.OWNER_EMAIL || 'maheshwariy071@gmail.com',
  password: __ENV.OWNER_PASSWORD || '7983346809@Yash',
};

export const TEST_CHEF_CREDENTIALS = {
  email: __ENV.CHEF_EMAIL || 'chef.dineverse@qrasoi.app',
  password: __ENV.CHEF_PASSWORD || '7983346809@Yash',
};

export const TEST_ADMIN_CREDENTIALS = {
  email: __ENV.ADMIN_EMAIL || 'maheshwariy077@gmail.com',
  password: __ENV.ADMIN_PASSWORD || 'admin123',
  totpCode: __ENV.ADMIN_TOTP || '123456',
};
