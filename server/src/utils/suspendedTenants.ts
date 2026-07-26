import fs from 'fs';
import path from 'path';

const PERSISTENT_SUBSCRIPTIONS_FILE = path.join(process.cwd(), 'tenant_subscriptions.json');

export interface TenantSubscriptionInfo {
  id: string;
  slug: string;
  status: 'unverified' | 'active' | 'suspended';
  validUntil: string | null; // ISO Date String
  updatedAt: string;
}

// In-Memory map of tenant subscriptions
const subscriptionsMap = new Map<string, TenantSubscriptionInfo>();

/**
 * Load tenant subscriptions from disk on process startup
 */
const loadFromDisk = () => {
  try {
    if (fs.existsSync(PERSISTENT_SUBSCRIPTIONS_FILE)) {
      const raw = fs.readFileSync(PERSISTENT_SUBSCRIPTIONS_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (Array.isArray(data)) {
        data.forEach((sub: TenantSubscriptionInfo) => {
          if (sub.id) subscriptionsMap.set(sub.id.toLowerCase(), sub);
          if (sub.slug) subscriptionsMap.set(sub.slug.toLowerCase(), sub);
        });
        console.log(`🔒 Loaded ${subscriptionsMap.size} tenant subscription records from disk.`);
      }
    }
  } catch (err) {
    console.warn('⚠️ Could not load tenant subscriptions from disk:', err);
  }
};

loadFromDisk();

/**
 * Save tenant subscriptions to disk
 */
const saveToDisk = () => {
  try {
    const list: TenantSubscriptionInfo[] = [];
    const seen = new Set<string>();

    subscriptionsMap.forEach((sub) => {
      if (!seen.has(sub.id)) {
        seen.add(sub.id);
        list.push(sub);
      }
    });

    fs.writeFileSync(PERSISTENT_SUBSCRIPTIONS_FILE, JSON.stringify(list, null, 2), 'utf-8');
    console.log(`💾 Saved ${list.length} tenant subscription records to disk.`);
  } catch (err) {
    console.warn('⚠️ Could not save tenant subscriptions to disk:', err);
  }
};

/**
 * Normalize tenant identifier (ID or slug)
 */
const normalizeKey = (idOrSlug?: string): string => {
  if (!idOrSlug) return '';
  return String(idOrSlug).toLowerCase().trim();
};

/**
 * Register a new tenant with initial UNVERIFIED status
 */
export const registerNewTenantSubscription = (id: string, slug: string): TenantSubscriptionInfo => {
  const normId = normalizeKey(id);
  const normSlug = normalizeKey(slug);

  const newSub: TenantSubscriptionInfo = {
    id,
    slug,
    status: 'unverified', // Newly registered accounts require admin verification!
    validUntil: null, // Set when approved by admin
    updatedAt: new Date().toISOString(),
  };

  subscriptionsMap.set(normId, newSub);
  subscriptionsMap.set(normSlug, newSub);
  if (normId.startsWith('rest-')) subscriptionsMap.set(normId.replace(/^rest-/, ''), newSub);

  saveToDisk();
  return newSub;
};

/**
 * Get tenant subscription info
 */
export const getTenantSubscription = (idOrSlug?: string): TenantSubscriptionInfo | null => {
  if (!idOrSlug) return null;
  const key = normalizeKey(idOrSlug);
  const rawKey = key.replace(/^rest-/, '');

  return (
    subscriptionsMap.get(key) ||
    subscriptionsMap.get(rawKey) ||
    subscriptionsMap.get(`rest-${rawKey}`) ||
    null
  );
};

/**
 * Update tenant status and optional validity date
 */
export const updateTenantSubscriptionStatus = (
  idOrSlug: string,
  status: 'unverified' | 'active' | 'suspended',
  validUntilDate?: string | null
): TenantSubscriptionInfo => {
  const normKey = normalizeKey(idOrSlug);
  const existing = getTenantSubscription(idOrSlug);

  const id = existing?.id || (normKey.startsWith('rest-') ? normKey : `rest-${normKey}`);
  const slug = existing?.slug || normKey.replace(/^rest-/, '');

  let validUntil = validUntilDate !== undefined ? validUntilDate : existing?.validUntil || null;

  // If activating for the first time without a validity date, set +30 days (1 month)
  if (status === 'active' && !validUntil) {
    const thirtyDays = new Date();
    thirtyDays.setDate(thirtyDays.getDate() + 30);
    validUntil = thirtyDays.toISOString();
  }

  const updatedSub: TenantSubscriptionInfo = {
    id,
    slug,
    status,
    validUntil,
    updatedAt: new Date().toISOString(),
  };

  subscriptionsMap.set(normalizeKey(id), updatedSub);
  subscriptionsMap.set(normalizeKey(slug), updatedSub);

  saveToDisk();
  return updatedSub;
};

/**
 * Extend tenant subscription by +1 Month (30 Days) from Admin Dashboard
 */
export const extendTenantSubscriptionMonth = (idOrSlug: string): TenantSubscriptionInfo => {
  const existing = getTenantSubscription(idOrSlug);
  const now = new Date();

  let baseDate = now;
  if (existing?.validUntil) {
    const currentValidUntil = new Date(existing.validUntil);
    if (currentValidUntil > now) {
      baseDate = currentValidUntil; // Extend from current expiration date
    }
  }

  const newValidUntil = new Date(baseDate);
  newValidUntil.setDate(newValidUntil.getDate() + 30); // Add 30 days (1 month)

  return updateTenantSubscriptionStatus(idOrSlug, 'active', newValidUntil.toISOString());
};

/**
 * Check if a tenant is suspended (legacy support helper)
 */
export const isTenantSuspended = (idOrSlug?: string): boolean => {
  const access = checkTenantAccessStatus(idOrSlug);
  return !access.isAllowed;
};

/**
 * Set tenant suspended state (legacy support helper)
 */
export const setTenantSuspendedState = (idOrSlug: string, suspend: boolean) => {
  updateTenantSubscriptionStatus(idOrSlug, suspend ? 'suspended' : 'active');
};

/**
 * Comprehensive check for tenant access status
 * Returns whether login / API / digital menu is allowed or blocked (unverified, suspended, or expired)
 */
export const checkTenantAccessStatus = (
  idOrSlug?: string
): { isAllowed: boolean; reason?: 'unverified' | 'suspended' | 'expired'; status: string; validUntil: string | null } => {
  if (!idOrSlug) return { isAllowed: true, status: 'active', validUntil: null };

  const sub = getTenantSubscription(idOrSlug);

  // If sub is not found in subscriptionsMap, fallback to checking inMemoryRestaurants or default to unverified
  let status: 'unverified' | 'active' | 'suspended' = sub?.status || 'active';
  let validUntil: string | null = sub?.validUntil || null;

  if (sub) {
    status = sub.status;
    validUntil = sub.validUntil;
  }

  if (status === 'unverified') {
    return { isAllowed: false, reason: 'unverified', status: 'unverified', validUntil };
  }

  if (status === 'suspended') {
    return { isAllowed: false, reason: 'suspended', status: 'suspended', validUntil };
  }

  // Check 1-month expiration date
  if (validUntil) {
    const validUntilDate = new Date(validUntil);
    if (new Date() > validUntilDate) {
      return { isAllowed: false, reason: 'expired', status: 'suspended', validUntil };
    }
  }

  return { isAllowed: true, status, validUntil };
};
