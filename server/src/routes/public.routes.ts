import { Router } from 'express';
import { getPublicMenuBySlug, placeCustomerOrder, getOrderStatus } from '../controllers/public.controller.js';

const router = Router();

router.get('/r/:slug', getPublicMenuBySlug);
router.post('/orders', placeCustomerOrder);
router.get('/orders/:orderId', getOrderStatus);

export default router;
export const publicRoutes = router;
