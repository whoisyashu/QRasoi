import { Response } from 'express';
import { nanoid } from 'nanoid';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { db } from '../config/db.js';
import { inMemoryRestaurants } from './auth.controller.js';
import { socketService } from '../services/socket.service.js';
import { cacheService } from '../services/cache.service.js';

/**
 * GET /api/owner/restaurant
 * Fetch authenticated owner's unique restaurant profile
 */
export const getRestaurantProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const restaurantId = req.user?.restaurantId;
    if (!restaurantId) {
      res.status(400).json({ error: 'Restaurant ID missing in request session.' });
      return;
    }

    let rest: any = null;

    if (db) {
      const { data, error } = await db.from('restaurants').select('id, slug, name, tagline, address, phone, cuisine, opening_hours, logo_url, cover_image_url, order_timeout_minutes, qr_code_url').eq('id', restaurantId).single();
      if (!error && data) {
        rest = data;
      }
    }

    if (!rest) {
      rest = inMemoryRestaurants.get(restaurantId);
    }

    if (!rest) {
      res.status(404).json({ error: 'Restaurant profile not found.' });
      return;
    }

    res.json({
      id: rest.id,
      slug: rest.slug,
      name: rest.name,
      tagline: rest.tagline || 'Simple Digital Menu',
      address: rest.address,
      phone: rest.phone,
      cuisine: rest.cuisine || 'Multi-Cuisine',
      openingHours: rest.opening_hours || '10:00 AM - 11:00 PM',
      logo: rest.logo_url || '',
      coverImage: rest.cover_image_url || '',
      orderTimeoutMinutes: rest.order_timeout_minutes || 15,
      qrCodeUrl: rest.qr_code_url || `https://qrasoi.app/r/${rest.slug}`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch restaurant profile' });
  }
};

/**
 * PUT /api/owner/restaurant
 * Update authenticated owner's unique restaurant profile
 */
export const updateRestaurantProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const restaurantId = req.user?.restaurantId;
    if (!restaurantId) {
      res.status(400).json({ error: 'Restaurant ID missing in request session.' });
      return;
    }

    const { name, tagline, address, phone, cuisine, openingHours, logo, coverImage, orderTimeoutMinutes } = req.body;

    const updatedData = {
      name,
      tagline,
      address,
      phone,
      cuisine,
      opening_hours: openingHours,
      logo_url: logo,
      cover_image_url: coverImage,
      order_timeout_minutes: Number(orderTimeoutMinutes) || 15,
      updated_at: new Date().toISOString(),
    };

    // Update in-memory store & invalidate public menu cache
    const currentMemory = inMemoryRestaurants.get(restaurantId) || {};
    inMemoryRestaurants.set(restaurantId, { ...currentMemory, ...updatedData });
    cacheService.clear();

    // Update in Supabase DB
    if (db) {
      const { error } = await db
        .from('restaurants')
        .update(updatedData)
        .eq('id', restaurantId);

      if (error) {
        console.error('❌ Supabase restaurant update error:', error);
        res.status(500).json({ error: `Supabase Error: ${error.message}` });
        return;
      }
    }

    res.json({
      message: 'Restaurant settings updated successfully',
      restaurant: {
        id: restaurantId,
        name,
        tagline,
        address,
        phone,
        cuisine,
        openingHours,
        logo,
        coverImage,
        orderTimeoutMinutes: Number(orderTimeoutMinutes) || 15,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update restaurant profile' });
  }
};

/**
 * GET /api/owner/orders
 */
export const getOwnerOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    let restaurantId = req.user?.restaurantId;

    if (db) {
      if (!restaurantId) {
        const { data: firstRest } = await db.from('restaurants').select('id').limit(1).maybeSingle();
        if (firstRest?.id) restaurantId = firstRest.id;
      }

      let query = db.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });
      if (restaurantId) {
        query = query.eq('restaurant_id', restaurantId);
      }

      const { data: orders } = await query;

      if (orders) {
        const mappedOrders = orders.map((row: any) => ({
          id: row.id,
          customerName: row.customer_name || 'Customer',
          customerPhone: row.customer_phone || '',
          tableNumber: row.table_number || 'Table 1',
          subtotal: Number(row.subtotal || 0),
          tax: Number(row.tax || 0),
          total: Number(row.total || row.subtotal || 0),
          status: row.status || 'pending',
          isPaymentVerified: Boolean(row.is_payment_verified),
          createdAt: row.created_at || new Date().toISOString(),
          estimatedTimeMinutes: Number(row.estimated_time_minutes || 15),
          items: (row.order_items || []).map((oi: any) => {
            const isReady = oi.status === 'ready' || Boolean(oi.notes && oi.notes.includes('[STATUS:READY]'));
            const cleanNotes = oi.notes ? oi.notes.replace('[STATUS:READY]', '').trim() : '';

            return {
              id: oi.id || `oi-${oi.menu_item_id}`,
              menuItem: {
                id: oi.menu_item_id || 'item-1',
                name: oi.item_name || 'Dish',
                price: Number(oi.price || 0),
              },
              quantity: Number(oi.quantity || 1),
              notes: cleanNotes,
              status: isReady ? 'ready' : 'preparing',
            };
          }),
        }));

        res.json(mappedOrders);
        return;
      }
    }

    res.json([]);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch owner orders' });
  }
};

/**
 * PATCH /api/owner/orders/:orderId/verify-payment
 */
export const verifyOrderPayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orderId = String(req.params.orderId);
    const restaurantId = String(req.user?.restaurantId || 'rest-outlet');

    if (db) {
      const { data: updated, error } = await db
        .from('orders')
        .update({
          is_payment_verified: true,
          status: 'preparing',
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;

      // Emit real-time Socket.IO event to Chef KDS and Customer Order Status Page
      socketService.emitPaymentVerified(restaurantId, orderId, { id: orderId, isPaymentVerified: true, status: 'preparing' });

      res.json(updated);
      return;
    }

    socketService.emitPaymentVerified(restaurantId, orderId, { id: orderId, isPaymentVerified: true, status: 'preparing' });
    res.json({ id: orderId, isPaymentVerified: true, status: 'preparing' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to verify order payment' });
  }
};

/**
 * GET /api/owner/menu
 * Fetch all menu items for the authenticated owner's restaurant with resolved category names
 */
export const getMenuItems = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const restaurantId = req.user?.restaurantId;
    if (!restaurantId) {
      res.status(400).json({ error: 'Restaurant ID missing.' });
      return;
    }

    if (db) {
      const { data: categories } = await db
        .from('categories')
        .select('*')
        .eq('restaurant_id', restaurantId);

      const categoryMap = new Map<string, string>();
      if (categories) {
        categories.forEach((cat: any) => {
          categoryMap.set(cat.id, cat.name);
        });
      }

      const { data: items, error } = await db
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false });

      if (!error && items) {
        const mappedItems = items.map((i: any) => {
          let resolvedCatName = 'General';
          if (i.category_id && categoryMap.has(i.category_id)) {
            resolvedCatName = categoryMap.get(i.category_id)!;
          } else if (i.category && categoryMap.has(i.category)) {
            resolvedCatName = categoryMap.get(i.category)!;
          } else if (i.category_name) {
            resolvedCatName = i.category_name;
          } else if (i.category && !i.category.startsWith('cat-')) {
            resolvedCatName = i.category;
          }

          return {
            id: i.id,
            name: i.name,
            description: i.description || '',
            price: Number(i.price),
            category: resolvedCatName,
            dietary: i.dietary || 'veg',
            image: i.image_url || i.image || '',
            isAvailable: i.is_available ?? true,
            isPopular: i.is_popular ?? false,
            preparationTimeMinutes: i.preparation_time_minutes || 15,
          };
        });
        res.json(mappedItems);
        return;
      }
    }

    res.json([]);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
};

/**
 * POST /api/owner/menu
 * Add a new food item and sync category to Supabase DB
 */
export const addMenuItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const restaurantId = req.user?.restaurantId;
    const { name, description, price, category, dietary, image, isAvailable, preparationTimeMinutes } = req.body;

    if (!restaurantId) {
      res.status(400).json({ error: 'Restaurant ID missing in session token.' });
      return;
    }

    const newItemId = `item-${nanoid(8)}`;
    let categoryId: string | null = null;

    // 1. Check or Insert category into 'categories' table
    if (db && category) {
      try {
        const { data: existingCat } = await db
          .from('categories')
          .select('id')
          .eq('restaurant_id', restaurantId)
          .ilike('name', category)
          .maybeSingle();

        if (existingCat?.id) {
          categoryId = existingCat.id;
        } else {
          const generatedCatId = `cat-${nanoid(6)}`;
          const { data: createdCat } = await db
            .from('categories')
            .insert({
              id: generatedCatId,
              restaurant_id: restaurantId,
              name: category,
            })
            .select('id')
            .maybeSingle();

          if (createdCat?.id) categoryId = createdCat.id;
        }
      } catch (catErr) {
        console.warn('⚠️ Category resolution warning:', catErr);
      }
    }

    // 2. Insert into 'menu_items' table with automatic schema column detection
    if (db) {
      const basePayload: any = {
        id: newItemId,
        restaurant_id: restaurantId,
        name,
        description: description || '',
        price: Number(price),
        dietary: dietary || 'veg',
        image_url: image || null,
        is_available: isAvailable ?? true,
      };

      if (categoryId) {
        const { data: res1, error: err1 } = await db
          .from('menu_items')
          .insert({ ...basePayload, category_id: categoryId })
          .select()
          .single();

        if (!err1 && res1) {
          res.status(201).json({ ...res1, category: category || 'General' });
          return;
        }
      }

      const { data: res2, error: err2 } = await db
        .from('menu_items')
        .insert({ ...basePayload, category: category || 'General' })
        .select()
        .single();

      if (!err2 && res2) {
        res.status(201).json({ ...res2, category: category || 'General' });
        return;
      }

      const { data: res3, error: err3 } = await db
        .from('menu_items')
        .insert(basePayload)
        .select()
        .single();

      if (!err3 && res3) {
        res.status(201).json({ ...res3, category: category || 'General' });
        return;
      }

      res.status(500).json({ error: `Supabase Insert Failed: ${err3?.message}` });
      return;
    }

    res.status(201).json({ id: newItemId, name, price, category });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to add menu item' });
  }
};

/**
 * PUT /api/owner/menu/:itemId
 * Update an existing food item in Supabase DB
 */
export const updateMenuItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { itemId } = req.params;
    const restaurantId = req.user?.restaurantId;
    const { name, description, price, category, dietary, image, isAvailable } = req.body;

    let categoryId: string | null = null;
    if (db && restaurantId && category) {
      try {
        const { data: existingCat } = await db
          .from('categories')
          .select('id')
          .eq('restaurant_id', restaurantId)
          .ilike('name', category)
          .maybeSingle();

        if (existingCat?.id) {
          categoryId = existingCat.id;
        } else {
          const generatedCatId = `cat-${nanoid(6)}`;
          const { data: createdCat } = await db
            .from('categories')
            .insert({ id: generatedCatId, restaurant_id: restaurantId, name: category })
            .select('id')
            .maybeSingle();

          if (createdCat?.id) categoryId = createdCat.id;
        }
      } catch (cErr) {
        console.warn('⚠️ Category edit warning:', cErr);
      }
    }

    if (db) {
      const updatePayload: any = {
        name,
        description: description || '',
        price: Number(price),
        dietary,
        image_url: image || null,
        is_available: isAvailable ?? true,
        updated_at: new Date().toISOString(),
      };

      if (categoryId) updatePayload.category_id = categoryId;
      updatePayload.category = category || 'General';

      await db.from('menu_items').update(updatePayload).eq('id', itemId);
    }

    res.json({ id: itemId, message: 'Menu item updated successfully' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update menu item' });
  }
};

/**
 * PATCH /api/owner/menu/:itemId/availability
 */
export const toggleMenuItemAvailability = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { itemId } = req.params;
    const { isAvailable } = req.body;

    if (db) {
      await db
        .from('menu_items')
        .update({ is_available: isAvailable, updated_at: new Date().toISOString() })
        .eq('id', itemId);
    }

    res.json({ id: itemId, isAvailable });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update item availability' });
  }
};

/**
 * DELETE /api/owner/menu/:itemId
 */
export const deleteMenuItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { itemId } = req.params;

    if (db) {
      await db.from('menu_items').delete().eq('id', itemId);
    }

    cacheService.clear();
    res.json({ message: 'Menu item deleted' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
};
