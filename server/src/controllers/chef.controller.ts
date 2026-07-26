import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { db } from '../config/db.js';
import { socketService } from '../services/socket.service.js';
import { inMemoryPublicOrders } from './public.controller.js';

/**
 * GET /api/chef/queue
 * Chef KDS queue (Rule 18: Chef ONLY sees payment-verified orders!)
 */
export const getChefQueue = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    let targetRestId = req.user?.restaurantId;

    if (db) {
      if (!targetRestId) {
        const { data: firstRest } = await db.from('restaurants').select('id').limit(1).maybeSingle();
        if (firstRest?.id) targetRestId = firstRest.id;
      }

      let query = db
        .from('orders')
        .select('*, order_items(*)')
        .eq('is_payment_verified', true)
        .neq('status', 'cancelled')
        .order('created_at', { ascending: true });

      if (targetRestId) {
        query = query.eq('restaurant_id', targetRestId);
      }

      const { data: chefOrders, error } = await query;

      if (!error && chefOrders) {
        const mappedOrders = chefOrders.map((row: any) => ({
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
          }),
        }));

        res.json(mappedOrders);
        return;
      }
    }

    res.json([]);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch chef queue' });
  }
};

/**
 * PATCH /api/chef/order-items/:itemId/status
 * Chef updates individual food item preparation status (preparing -> ready)
 */
export const updateOrderItemStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const itemId = String(req.params.itemId);
    const { status } = req.body; // status: 'ready' | 'preparing'
    const orderId = String(req.params.orderId || req.body.orderId || '');
    const restaurantId = String(req.user?.restaurantId || 'rest-outlet');

    if (db) {
      let targetOrderId = orderId;

      // 1. Fetch current order item to get notes and order_id
      let { data: item } = await db
        .from('order_items')
        .select('*')
        .eq('id', itemId)
        .maybeSingle();

      if (!item && orderId) {
        const { data: itemByMenu } = await db
          .from('order_items')
          .select('*')
          .eq('order_id', orderId)
          .eq('menu_item_id', itemId)
          .maybeSingle();
        if (itemByMenu) item = itemByMenu;
      }

      if (item) {
        targetOrderId = item.order_id || orderId;
        const currentNotes = item.notes || '';
        let updatedNotes = currentNotes;

        if (status === 'ready' && !currentNotes.includes('[STATUS:READY]')) {
          updatedNotes = currentNotes ? `${currentNotes} [STATUS:READY]` : '[STATUS:READY]';
        } else if (status === 'preparing' && currentNotes.includes('[STATUS:READY]')) {
          updatedNotes = currentNotes.replace('[STATUS:READY]', '').trim();
        }

        // Try updating explicit 'status' column + notes string tag for dual compatibility
        try {
          await db
            .from('order_items')
            .update({ status, notes: updatedNotes })
            .eq('id', item.id);
        } catch {
          await db
            .from('order_items')
            .update({ notes: updatedNotes })
            .eq('id', item.id);
        }
      }

      // 2. Check if ALL items for this order are 'ready'
      let isAllReady = false;

      // Synchronize in-memory fallback store as well
      const memKey = targetOrderId || orderId;
      const rawMemKey = memKey.replace(/^QR-/, '');
      const memOrder = inMemoryPublicOrders.get(memKey) || inMemoryPublicOrders.get(`QR-${rawMemKey}`) || inMemoryPublicOrders.get(rawMemKey);
      if (memOrder && memOrder.items) {
        let memAllReady = true;
        memOrder.items.forEach((it: any) => {
          const isItMatch =
            it.id === itemId ||
            it.menuItem?.id === itemId ||
            (it as any).menu_item_id === itemId ||
            itemId === `oi-${it.menuItem?.id || ''}`;
          if (isItMatch) {
            it.status = status;
            if (status === 'ready' && (!it.notes || !it.notes.includes('[STATUS:READY]'))) {
              it.notes = it.notes ? `${it.notes} [STATUS:READY]` : '[STATUS:READY]';
            }
          }
          const isItReady = it.status === 'ready' || (it.notes && it.notes.includes('[STATUS:READY]'));
          if (!isItReady) {
            memAllReady = false;
          }
        });
        if (memAllReady) {
          memOrder.status = 'ready';
          isAllReady = true;
          socketService.emitOrderStatusUpdated(restaurantId, memOrder.id, 'ready');
        }
      }

      if (targetOrderId && db) {
        const { data: allItems } = await db
          .from('order_items')
          .select('notes, status')
          .eq('order_id', targetOrderId);

        if (allItems && allItems.length > 0) {
          isAllReady = allItems.every(
            (i: any) => i.status === 'ready' || (i.notes && i.notes.includes('[STATUS:READY]'))
          );
          if (isAllReady) {
            await db
              .from('orders')
              .update({ status: 'ready', updated_at: new Date().toISOString() })
              .eq('id', targetOrderId);

            socketService.emitOrderStatusUpdated(restaurantId, targetOrderId, 'ready');
          }
        }
      }

      // Emit targeted Socket.IO real-time event to connected owner, kitchen, and customer tracking rooms
      socketService.emitOrderItemStatusUpdated(restaurantId, targetOrderId || orderId, {
        itemId,
        orderId: targetOrderId || orderId,
        status,
        isOrderReady: isAllReady,
      });

      res.json({ id: itemId, orderId: targetOrderId, status });
      return;
    }

    socketService.emitOrderItemStatusUpdated(restaurantId, orderId, { itemId, orderId, status });
    res.json({ id: itemId, status });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update order item status' });
  }
};

/**
 * PATCH /api/chef/orders/:orderId/status
 * Update overall order status (e.g. ready or completed)
 */
export const updateChefOrderStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const rawId = req.params.orderId as string;
    const targetOrderId = (rawId || '').trim();
    const { status } = req.body;
    const restaurantId = req.user?.restaurantId || 'rest-outlet';

    // Sync status update to in-memory store for instant public tracking
    const memObj = inMemoryPublicOrders.get(targetOrderId);
    if (memObj) {
      memObj.status = status;
      inMemoryPublicOrders.set(targetOrderId, memObj);
    }

    if (db) {
      const { data: updated } = await db
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', targetOrderId)
        .select()
        .single();

      if (status === 'ready' || status === 'completed') {
        const { data: allItems } = await db.from('order_items').select('*').eq('order_id', targetOrderId);
        if (allItems) {
          for (const item of allItems) {
            const currentNotes = item.notes || '';
            const newNotes = !currentNotes.includes('[STATUS:READY]')
              ? currentNotes ? `${currentNotes} [STATUS:READY]` : '[STATUS:READY]'
              : currentNotes;
            try {
              await db.from('order_items').update({ status: 'ready', notes: newNotes }).eq('id', item.id);
            } catch {
              await db.from('order_items').update({ notes: newNotes }).eq('id', item.id);
            }
          }
        }
      }

      // Emit real-time Socket.IO event to Owner and Customer Order Status Page
      socketService.emitOrderStatusUpdated(restaurantId, targetOrderId, status, updated);

      res.json(updated);
      return;
    }

    socketService.emitOrderStatusUpdated(restaurantId, targetOrderId, status);
    res.json({ id: targetOrderId, status });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
};

