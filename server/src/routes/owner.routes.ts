import { Router } from 'express';
import { authenticateToken, requireRoles } from '../middlewares/auth.middleware.js';
import {
  getRestaurantProfile,
  updateRestaurantProfile,
  getOwnerOrders,
  verifyOrderPayment,
  cancelOrder,
  updateOrderStatus,
  getMenuItems,
  addMenuItem,
  updateMenuItem,
  toggleMenuItemAvailability,
  deleteMenuItem,
} from '../controllers/owner.controller.js';
import {
  getChefs,
  createChef,
  updateChefStatus,
  resetChefPassword,
  deleteChef,
} from '../controllers/chefManagement.controller.js';

const router = Router();

router.use(authenticateToken, requireRoles(['owner', 'admin', 'chef']));

// Restaurant Profile Settings
router.get('/restaurant', getRestaurantProfile);
router.put('/restaurant', updateRestaurantProfile);

// Orders & Menu Management (Supabase Database Persistence)
router.get('/orders', getOwnerOrders);
router.patch('/orders/:orderId/verify-payment', verifyOrderPayment);
router.patch('/orders/:orderId/cancel', cancelOrder);
router.patch('/orders/:orderId/status', updateOrderStatus);
router.get('/menu', getMenuItems);
router.post('/menu', addMenuItem);
router.put('/menu/:itemId', updateMenuItem);
router.patch('/menu/:itemId/availability', toggleMenuItemAvailability);
router.delete('/menu/:itemId', deleteMenuItem);

// Chef Management
router.get('/chefs', getChefs);
router.post('/chefs', createChef);
router.patch('/chefs/:id/status', updateChefStatus);
router.post('/chefs/:id/reset-password', resetChefPassword);
router.delete('/chefs/:id', deleteChef);

export default router;
export const ownerRoutes = router;
