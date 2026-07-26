import { Router } from 'express';
import { authenticateToken, requireRoles } from '../middlewares/auth.middleware.js';
import { getChefQueue, updateChefOrderStatus, updateOrderItemStatus } from '../controllers/chef.controller.js';

const router = Router();

router.use(authenticateToken, requireRoles(['chef', 'owner', 'admin']));

router.get('/queue', getChefQueue);
router.patch('/order-items/:itemId/status', updateOrderItemStatus);
router.patch('/orders/:orderId/items/:itemId/status', updateOrderItemStatus);
router.patch('/orders/:orderId/status', updateChefOrderStatus);

export default router;
export const chefRoutes = router;
