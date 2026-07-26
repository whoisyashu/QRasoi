import { Request, Response } from 'express';
import { nanoid } from 'nanoid';
import { db } from '../config/db.js';
import { checkTenantAccessStatus, isTenantSuspended } from '../utils/suspendedTenants.js';

/**
 * GET /api/public/r/:slug
 * Fetch public digital menu, categories, and restaurant profile using NanoID slug token
 */
export const getPublicMenuBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const slug = req.params.slug as string;

    const access = checkTenantAccessStatus(slug);
    if (!access.isAllowed) {
      if (access.reason === 'unverified') {
        res.status(403).json({
          error: 'This restaurant digital menu is pending Admin Verification. Contact Admin (WhatsApp: +91 9368967944, Email: whoisyashu04@gmail.com).',
          isUnverified: true,
        });
        return;
      }
      res.status(403).json({
        error: 'This restaurant digital menu has been suspended by the platform administrator. Contact Admin (WhatsApp: +91 9368967944, Email: whoisyashu04@gmail.com).',
        isSuspended: true,
      });
      return;
    }

    if (db) {
      const { data: restaurant, error: restErr } = await db
        .from('restaurants')
        .select('*')
        .eq('slug', slug)
        .single();

      if (restErr || !restaurant) {
        res.status(404).json({ error: 'Restaurant digital menu not found.' });
        return;
      }

      const restAccess = checkTenantAccessStatus(restaurant.id) || checkTenantAccessStatus(restaurant.slug);
      if (!restAccess.isAllowed || restaurant.status === 'suspended' || restaurant.status === 'unverified') {
        if (restAccess.reason === 'unverified' || restaurant.status === 'unverified') {
          res.status(403).json({
            error: 'This restaurant digital menu is pending Admin Verification. Contact Admin (WhatsApp: +91 9368967944, Email: whoisyashu04@gmail.com).',
            isUnverified: true,
          });
          return;
        }
        res.status(403).json({
          error: 'This restaurant digital menu has been suspended by the platform administrator. Contact Admin (WhatsApp: +91 9368967944, Email: whoisyashu04@gmail.com).',
          isSuspended: true,
        });
        return;
      }

      const { data: rawCategories } = await db
        .from('categories')
        .select('*')
        .eq('restaurant_id', restaurant.id);

      const categoryMap = new Map<string, string>();
      if (rawCategories) {
        rawCategories.forEach((cat: any) => {
          categoryMap.set(cat.id, cat.name);
        });
      }

      const { data: rawItems } = await db
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', restaurant.id);

      const items = (rawItems || []).map((i: any) => {
        let resolvedCategory = 'General';
        if (i.category_id && categoryMap.has(i.category_id)) {
          resolvedCategory = categoryMap.get(i.category_id)!;
        } else if (i.category && categoryMap.has(i.category)) {
          resolvedCategory = categoryMap.get(i.category)!;
        } else if (i.category_name) {
          resolvedCategory = i.category_name;
        } else if (i.category && !i.category.startsWith('cat-')) {
          resolvedCategory = i.category;
        }

        return {
          id: i.id,
          name: i.name,
          description: i.description || '',
          price: Number(i.price),
          category: resolvedCategory,
          dietary: i.dietary || 'veg',
          image: i.image_url || i.image || '',
          isAvailable: i.is_available ?? true,
          isPopular: i.is_popular ?? false,
          preparationTimeMinutes: i.preparation_time_minutes || 15,
        };
      });

      res.json({
        restaurant: {
          id: restaurant.id,
          slug: restaurant.slug,
          name: restaurant.name,
          tagline: restaurant.tagline || 'Simple Digital Menu',
          address: restaurant.address,
          phone: restaurant.phone,
          cuisine: restaurant.cuisine || 'Multi-Cuisine',
          openingHours: restaurant.opening_hours || '10:00 AM - 11:00 PM',
          logo: restaurant.logo_url || '',
          coverImage: restaurant.cover_image_url || '',
          orderTimeoutMinutes: restaurant.order_timeout_minutes || 15,
          qrCodeUrl: restaurant.qr_code_url || `https://qrasoi.app/r/${restaurant.slug}`,
        },
        categories: rawCategories || [],
        items,
      });
      return;
    }

    res.json({
      restaurant: {
        id: `rest-${slug}`,
        name: 'Digital Restaurant',
        slug,
        tagline: 'Simple Digital Menu',
        address: 'Main Market Road',
        phone: '+91 98765 43210',
        cuisine: 'Multi-Cuisine',
        openingHours: '10:00 AM - 11:00 PM',
      },
      categories: [{ id: 'cat-all', name: 'All Items' }],
      items: [],
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to load public menu' });
  }
};

/**
 * POST /api/public/orders
 * Customer places digital order -> saves to Supabase DB 'orders' and 'order_items' tables
 */
export const placeCustomerOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { restaurantSlug, customerName, customerPhone, tableNumber, items, subtotal } = req.body;

    const orderId = `QR-${nanoid(6).toUpperCase()}`;

    let restaurantId = 'rest-outlet';
    if (db) {
      if (restaurantSlug) {
        const { data: rest } = await db.from('restaurants').select('id').eq('slug', restaurantSlug).maybeSingle();
        if (rest?.id) restaurantId = rest.id;
      }
      if (restaurantId === 'rest-outlet') {
        const { data: firstRest } = await db.from('restaurants').select('id').limit(1).maybeSingle();
        if (firstRest?.id) restaurantId = firstRest.id;
      }

      // Insert Order into PostgreSQL 'orders' table
      const { error: orderErr } = await db.from('orders').insert({
        id: orderId,
        restaurant_id: restaurantId,
        customer_name: customerName || 'Customer',
        customer_phone: customerPhone || '',
        table_number: tableNumber || 'Table 1',
        subtotal: Number(subtotal || 0),
        tax: 0,
        total: Number(subtotal || 0),
        status: 'pending',
        is_payment_verified: false,
        estimated_time_minutes: 15,
        created_at: new Date().toISOString(),
      });

      if (orderErr) {
        console.error('❌ Supabase order insert error:', orderErr);
      }

      // Insert Order Items using standard DB columns (id, order_id, menu_item_id, item_name, price, quantity, notes)
      if (items && Array.isArray(items)) {
        const orderItemsPayload = items.map((item: any) => ({
          id: `oi-${nanoid(8)}`,
          order_id: orderId,
          menu_item_id: item.menuItem?.id || item.id || 'item-1',
          item_name: item.menuItem?.name || item.name || 'Dish',
          price: Number(item.menuItem?.price || item.price || 0),
          quantity: Number(item.quantity || 1),
          notes: item.notes || null,
        }));

        const { error: itemErr } = await db.from('order_items').insert(orderItemsPayload);
        if (itemErr) {
          console.warn('⚠️ Supabase order_items insert retry with base fields:', itemErr.message);
          const fallbackPayload = items.map((item: any) => ({
            order_id: orderId,
            menu_item_id: item.menuItem?.id || item.id || 'item-1',
            item_name: item.menuItem?.name || item.name || 'Dish',
            price: Number(item.menuItem?.price || item.price || 0),
            quantity: Number(item.quantity || 1),
            notes: item.notes || null,
          }));
          await db.from('order_items').insert(fallbackPayload);
        }
      }
    }

    // Always save order in inMemoryPublicOrders for instant public status lookups
    const formattedOrderObj = {
      id: orderId,
      customerName: customerName || 'Customer',
      customerPhone: customerPhone || '',
      tableNumber: tableNumber || 'Table 1',
      subtotal: Number(subtotal || 0),
      tax: 0,
      total: Number(subtotal || 0),
      status: 'pending',
      isPaymentVerified: false,
      createdAt: new Date().toISOString(),
      estimatedTimeMinutes: 15,
      items: (items || []).map((item: any) => ({
        id: `oi-${nanoid(8)}`,
        menuItem: {
          id: item.menuItem?.id || item.id || 'item-1',
          name: item.menuItem?.name || item.name || 'Dish',
          description: '',
          price: Number(item.menuItem?.price || item.price || 0),
          category: 'Main Course',
          dietary: 'veg',
          isAvailable: true,
          preparationTimeMinutes: 15,
        },
        quantity: Number(item.quantity || 1),
        notes: item.notes || '',
        status: 'preparing',
      })),
    };
    inMemoryPublicOrders.set(orderId, formattedOrderObj);

    res.status(201).json({
      message: 'Order placed successfully',
      orderId,
      status: 'pending',
      tableNumber,
      total: subtotal,
    });
  } catch (err: any) {
    console.error('Order placement error:', err);
    res.status(500).json({ error: 'Order placement failed' });
  }
};

// Shared in-memory store for active customer orders
export const inMemoryPublicOrders = new Map<string, any>();

/**
 * GET /api/public/orders/:orderId
 * Customer tracks live order status directly from Supabase DB or in-memory fallback
 */
export const getOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawOrderId = (req.params.orderId as string).trim();
    const formattedId = rawOrderId.startsWith('QR-') ? rawOrderId : `QR-${rawOrderId}`;

    // Variations to handle Zero (0) vs Letter (O) & 1 vs I confusion
    const idsToTry = Array.from(
      new Set([
        formattedId,
        rawOrderId,
        formattedId.toUpperCase(),
        rawOrderId.toUpperCase(),
        formattedId.replace(/O/gi, '0'),
        formattedId.replace(/0/g, 'O'),
        rawOrderId.replace(/O/gi, '0'),
        rawOrderId.replace(/0/g, 'O'),
        `QR-${rawOrderId.replace(/O/gi, '0')}`,
        `QR-${rawOrderId.replace(/0/g, 'O')}`,
      ])
    );

    if (db) {
      // 1. Fetch order from 'orders' table matching any ID variant
      let { data: order } = await db.from('orders').select('*').in('id', idsToTry).maybeSingle();

      // Fallback: Individual checks if .in() fails
      if (!order) {
        for (const candidate of idsToTry) {
          const { data } = await db.from('orders').select('*').eq('id', candidate).maybeSingle();
          if (data) {
            order = data;
            break;
          }
        }
      }

      if (order) {
        // 2. Fetch order items separately to avoid PostgREST relationship join errors
        const { data: rawItems } = await db.from('order_items').select('*').eq('order_id', order.id);

        const itemsList = (rawItems || []).map((oi: any) => {
          const isReady = Boolean(oi.notes && oi.notes.includes('[STATUS:READY]'));
          const cleanNotes = oi.notes ? oi.notes.replace('[STATUS:READY]', '').trim() : '';

          return {
            id: oi.id || `oi-${oi.menu_item_id}`,
            menuItem: {
              id: oi.menu_item_id || 'item-1',
              name: oi.item_name || 'Dish',
              description: '',
              price: Number(oi.price || 0),
              category: 'Main Course',
              dietary: 'veg',
              isAvailable: true,
              preparationTimeMinutes: 15,
            },
            quantity: Number(oi.quantity || 1),
            notes: cleanNotes,
            status: isReady ? 'ready' : 'preparing',
          };
        });

        let restName = 'DineVerse Bistro';
        let restAddr = 'Flat No.13A, Bankey Bihari Enclave';
        let restPhone = '+91 9368967944';

        if (order.restaurant_id) {
          const { data: rest } = await db.from('restaurants').select('*').eq('id', order.restaurant_id).maybeSingle();
          if (rest) {
            if (rest.name && rest.name !== 'Your Restaurant Name') restName = rest.name;
            if (rest.address) restAddr = rest.address;
            if (rest.phone) restPhone = rest.phone;
          }
        }

        const resultObj = {
          id: order.id,
          customerName: order.customer_name || 'Customer',
          customerPhone: order.customer_phone || '',
          tableNumber: order.table_number || 'Table 1',
          subtotal: Number(order.subtotal || 0),
          tax: Number(order.tax || 0),
          total: Number(order.total || order.subtotal || 0),
          status: order.status || 'pending',
          isPaymentVerified: Boolean(order.is_payment_verified),
          createdAt: order.created_at || new Date().toISOString(),
          estimatedTimeMinutes: Number(order.estimated_time_minutes || 15),
          restaurantId: order.restaurant_id || 'rest-1',
          restaurantName: restName,
          restaurantAddress: restAddr,
          restaurantPhone: restPhone,
          items: itemsList,
        };

        // Cache in memory for quick retrieval
        inMemoryPublicOrders.set(order.id, resultObj);
        inMemoryPublicOrders.set(formattedId, resultObj);

        res.json(resultObj);
        return;
      }
    }

    // Fallback: Check in-memory store
    const memOrder =
      inMemoryPublicOrders.get(formattedId) ||
      inMemoryPublicOrders.get(rawOrderId) ||
      Array.from(inMemoryPublicOrders.values()).find(
        (o) => o.id.toLowerCase() === formattedId.toLowerCase() || o.id.toLowerCase() === rawOrderId.toLowerCase()
      );

    if (memOrder) {
      res.json(memOrder);
      return;
    }

    res.status(404).json({ error: 'Order not found.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve order status' });
  }
};
