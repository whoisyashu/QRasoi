import { Router } from 'express';
import { authenticateToken, requireRoles } from '../middlewares/auth.middleware.js';
import {
  getAdminMetrics,
  getAdminTenants,
  updateTenantStatus,
  extendTenantSubscription,
  updateSystemConfig,
} from '../controllers/admin.controller.js';
import {
  get2FAStatus,
  setup2FA,
  enable2FA,
  disable2FA,
  regenerateBackupCodes,
} from '../controllers/admin2fa.controller.js';

const router = Router();

router.use(authenticateToken, requireRoles(['admin']));

// 2FA Management Endpoints
router.get('/2fa/status', get2FAStatus);
router.post('/2fa/setup', setup2FA);
router.post('/2fa/enable', enable2FA);
router.post('/2fa/disable', disable2FA);
router.post('/2fa/regenerate-backup-codes', regenerateBackupCodes);

// Metrics, Tenants & System Config
router.get('/metrics', getAdminMetrics);
router.get('/tenants', getAdminTenants);
router.patch('/tenants/:id/status', updateTenantStatus);
router.post('/tenants/:id/extend-subscription', extendTenantSubscription);
router.post('/system-config', updateSystemConfig);

export default router;
export const adminRoutes = router;
