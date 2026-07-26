import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { db } from '../config/db.js';
import { inMemoryRestaurants } from './auth.controller.js';
import {
  getTenantSubscription,
  updateTenantSubscriptionStatus,
  extendTenantSubscriptionMonth,
  checkTenantAccessStatus,
  isTenantSuspended,
  setTenantSuspendedState,
} from '../utils/suspendedTenants.js';

let systemConfig = {
  maintenanceMode: false,
  allowNewRegistrations: true,
  announcementBanner: '',
};

export interface TenantRecord {
  id: string;
  name: string;
  slug: string;
  address: string;
  cuisine: string;
  phone: string;
  ownerName: string;
  ownerEmail: string;
  menuItemsCount: number;
  ordersCount: number;
  revenue: number;
  status: string;
  validUntil?: string | null;
  plan: string;
  createdAt: string;
}

/**
 * Default fallback / seed tenants for initial setup
 */
const DEFAULT_TENANTS: TenantRecord[] = [
  {
    id: 'rest-dhaba-01',
    name: 'Royal Dhaba & Cafe',
    slug: 'rest-dhaba-01',
    address: 'Main Highway, Delhi',
    cuisine: 'North Indian',
    phone: '+91 98765 43210',
    ownerName: 'Rahul Sharma',
    ownerEmail: 'owner@dhaba.com',
    menuItemsCount: 18,
    ordersCount: 42,
    revenue: 14500,
    status: 'active',
    validUntil: null,
    plan: 'Pro Outlet (₹250/mo)',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rest-outlet-02',
    name: 'Chaayos & Bites',
    slug: 'chaayos-bites',
    address: 'DLF Cyber City, Gurugram',
    cuisine: 'Tea & Snacks',
    phone: '+91 98111 22334',
    ownerName: 'Priya Verma',
    ownerEmail: 'priya@chaayos.com',
    menuItemsCount: 12,
    ordersCount: 28,
    revenue: 8900,
    status: 'active',
    validUntil: null,
    plan: 'Pro Outlet (₹250/mo)',
    createdAt: new Date().toISOString(),
  },
];

/**
 * GET /api/admin/metrics
 * Fetch platform-wide SaaS executive metrics (Calculated from actual database / active tenants)
 */
export const getAdminMetrics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    let restaurantsCount = 0;
    let ordersCount = 0;
    let totalRevenue = 0;
    let menuItemsCount = 0;

    if (db) {
      const { count: restCount } = await db.from('restaurants').select('*', { count: 'exact', head: true });
      restaurantsCount = restCount || 0;

      const { count: ordCount, data: ordData } = await db.from('orders').select('total');
      ordersCount = ordCount || (ordData ? ordData.length : 0);
      if (ordData) {
        totalRevenue = ordData.reduce((acc: number, o: any) => acc + Number(o.total || 0), 0);
      }

      const { count: itemCount } = await db.from('menu_items').select('*', { count: 'exact', head: true });
      menuItemsCount = itemCount || 0;
    } else {
      restaurantsCount = inMemoryRestaurants.size;
      // In-memory fallback calculation
      restaurantsCount = inMemoryRestaurants.size;
      ordersCount = 0;
      totalRevenue = 0;
      menuItemsCount = 0;
    }

    res.json({
      restaurantsCount,
      ordersCount,
      totalRevenue,
      menuItemsCount,
      dbStatus: db ? 'connected' : 'in-memory',
      systemConfig,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch admin metrics' });
  }
};

/**
 * GET /api/admin/tenants
 * Fetch all onboarded restaurant tenants with exact subscription and verification status
 */
export const getAdminTenants = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (db) {
      const { data: restaurants, error } = await db.from('restaurants').select('*').order('created_at', { ascending: false });
      const { data: users } = await db.from('users').select('*').eq('role', 'owner');
      const { data: menuItems } = await db.from('menu_items').select('restaurant_id');
      const { data: orders } = await db.from('orders').select('restaurant_id, total');

      if (!error && restaurants && restaurants.length > 0) {
        const mappedTenants = restaurants.map((r: any) => {
          const owner = (users || []).find((u: any) => u.restaurant_id === r.id || u.email === r.email);
          const tenantItems = (menuItems || []).filter((m: any) => m.restaurant_id === r.id);
          const tenantOrders = (orders || []).filter((o: any) => o.restaurant_id === r.id);
          const tenantRevenue = tenantOrders.reduce((acc: number, o: any) => acc + Number(o.total || 0), 0);

          const sub = getTenantSubscription(r.id || r.slug);
          const access = checkTenantAccessStatus(r.id || r.slug);

          let currentStatus = r.status || 'active';
          if (sub?.status) currentStatus = sub.status;
          if (!access.isAllowed) {
            currentStatus = access.reason === 'unverified' ? 'unverified' : 'suspended';
          }

          return {
            id: r.id,
            name: r.name,
            slug: r.slug,
            address: r.address || 'India',
            cuisine: r.cuisine || 'Multi-Cuisine',
            phone: r.phone || '',
            ownerName: owner?.full_name || owner?.name || 'Restaurant Owner',
            ownerEmail: owner?.email || r.email || 'owner@restaurant.com',
            menuItemsCount: tenantItems.length,
            ordersCount: tenantOrders.length,
            revenue: tenantRevenue,
            status: currentStatus,
            validUntil: sub?.validUntil || null,
            plan: 'Pro Outlet (₹250/mo)',
            createdAt: r.created_at || new Date().toISOString(),
          };
        });

        res.json(mappedTenants);
        return;
      }
    }

    // Fallback: Return inMemoryRestaurants if populated, or DEFAULT_TENANTS if empty
    const resultList: TenantRecord[] = [];
    if (inMemoryRestaurants.size > 0) {
      inMemoryRestaurants.forEach((val, key) => {
        const sub = getTenantSubscription(key || val.slug);
        const access = checkTenantAccessStatus(key || val.slug);

        let currentStatus = val.status || 'active';
        if (sub?.status) currentStatus = sub.status;
        if (!access.isAllowed) {
          currentStatus = access.reason === 'unverified' ? 'unverified' : 'suspended';
        }

        resultList.push({
          id: val.id || key,
          name: val.name || key,
          slug: val.slug || key,
          address: val.address || 'India',
          cuisine: val.cuisine || 'Multi-Cuisine',
          phone: val.phone || '',
          ownerName: val.ownerName || 'Restaurant Owner',
          ownerEmail: val.ownerEmail || 'owner@restaurant.com',
          menuItemsCount: 0,
          ordersCount: 0,
          revenue: 0,
          status: currentStatus,
          validUntil: sub?.validUntil || null,
          plan: 'Pro Outlet (₹250/mo)',
          createdAt: val.createdAt || new Date().toISOString(),
        });
      });
    } else {
      resultList.push(...DEFAULT_TENANTS);
    }

    const finalRes = resultList.map((t) => {
      const sub = getTenantSubscription(t.id || t.slug);
      const access = checkTenantAccessStatus(t.id || t.slug);
      let currentStatus = t.status || 'active';
      if (sub?.status) currentStatus = sub.status;
      if (!access.isAllowed) {
        currentStatus = access.reason === 'unverified' ? 'unverified' : 'suspended';
      }

      return {
        ...t,
        status: currentStatus,
        validUntil: sub?.validUntil || null,
      };
    });

    res.json(finalRes);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch restaurant tenants' });
  }
};

/**
 * PATCH /api/admin/tenants/:id/status
 * Suspend, verify/activate, or mark unverified a restaurant tenant
 */
export const updateTenantStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const targetId = String(req.params.id);
    const { status } = req.body; // 'active' | 'unverified' | 'suspended'

    if (!targetId || !status) {
      res.status(400).json({ error: 'Tenant ID and status are required.' });
      return;
    }

    // 1. Update Persistent Subscription Manager
    const updatedSub = updateTenantSubscriptionStatus(targetId, status as any);

    // 2. Update In-Memory Map
    const existing = inMemoryRestaurants.get(targetId) || DEFAULT_TENANTS.find((t) => t.id === targetId || t.slug === targetId);
    inMemoryRestaurants.set(targetId, {
      ...existing,
      id: targetId,
      status,
      updated_at: new Date().toISOString(),
    });

    // Also update DEFAULT_TENANTS array in memory
    const defaultIdx = DEFAULT_TENANTS.findIndex((t) => t.id === targetId || t.slug === targetId);
    if (defaultIdx >= 0) {
      DEFAULT_TENANTS[defaultIdx].status = status;
    }

    // 3. Gracefully update Supabase DB without crashing
    if (db) {
      try {
        await db
          .from('restaurants')
          .update({ status, updated_at: new Date().toISOString() })
          .or(`id.eq.${targetId},slug.eq.${targetId}`);
      } catch (dbErr: any) {
        console.warn(`⚠️ Supabase update catch notice for [${targetId}]:`, dbErr?.message || dbErr);
      }
    }

    res.json({ id: targetId, status: updatedSub.status, validUntil: updatedSub.validUntil, message: `Tenant status updated to ${status}` });
  } catch (err: any) {
    console.error('❌ Failed to update tenant status:', err);
    res.status(500).json({ error: err.message || 'Failed to update tenant status' });
  }
};

/**
 * POST /api/admin/tenants/:id/extend-subscription
 * Extends restaurant subscription by +1 Month (30 Days) and sets status to active
 */
export const extendTenantSubscription = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const targetId = String(req.params.id);
    if (!targetId) {
      res.status(400).json({ error: 'Tenant ID is required.' });
      return;
    }

    const updatedSub = extendTenantSubscriptionMonth(targetId);

    // Also sync in-memory map
    const existing = inMemoryRestaurants.get(targetId) || DEFAULT_TENANTS.find((t) => t.id === targetId || t.slug === targetId);
    inMemoryRestaurants.set(targetId, {
      ...existing,
      id: targetId,
      status: 'active',
      updated_at: new Date().toISOString(),
    });

    res.json({
      id: targetId,
      status: 'active',
      validUntil: updatedSub.validUntil,
      message: 'Subscription extended by +1 Month (30 Days) successfully.',
    });
  } catch (err: any) {
    console.error('❌ Failed to extend tenant subscription:', err);
    res.status(500).json({ error: err.message || 'Failed to extend subscription' });
  }
};

/**
 * POST /api/admin/system-config
 * Update maintenance mode or global announcement
 */
export const updateSystemConfig = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { maintenanceMode, allowNewRegistrations, announcementBanner } = req.body;

    if (typeof maintenanceMode === 'boolean') systemConfig.maintenanceMode = maintenanceMode;
    if (typeof allowNewRegistrations === 'boolean') systemConfig.allowNewRegistrations = allowNewRegistrations;
    if (typeof announcementBanner === 'string') systemConfig.announcementBanner = announcementBanner;

    res.json({ message: 'System configuration updated successfully', systemConfig });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update system config' });
  }
};
