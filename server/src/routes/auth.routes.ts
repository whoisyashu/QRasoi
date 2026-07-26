import { Router } from 'express';
import {
  registerOwner,
  loginUser,
  loginChef,
  getMe,
  requestPasswordResetOtp,
  verifyPasswordResetOtp,
  resetPasswordWithOtp,
} from '../controllers/auth.controller.js';
import { adminLoginStage1, adminVerify2FAStage2 } from '../controllers/admin2fa.controller.js';

const router = Router();

router.post('/register', registerOwner);
router.post('/login', loginUser);
router.post('/chef/login', loginChef);
router.post('/admin/login', adminLoginStage1);
router.post('/admin/2fa/verify', adminVerify2FAStage2);

// Password Reset OTP Routes
router.post('/forgot-password/request-otp', requestPasswordResetOtp);
router.post('/forgot-password/verify-otp', verifyPasswordResetOtp);
router.post('/forgot-password/reset-password', resetPasswordWithOtp);

router.get('/me', getMe);

export default router;
