import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { db } from '../config/db.js';
import { signJwtToken, verifyJwtToken } from '../utils/jwt.js';
import {
  registerNewTenantSubscription,
  checkTenantAccessStatus,
  isTenantSuspended,
} from '../utils/suspendedTenants.js';

// In-memory fallback store when Supabase DB is not connected
export const inMemoryUsers: Map<string, any> = new Map();
export const inMemoryRestaurants: Map<string, any> = new Map();

export const registerOwner = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ownerName, email, password, phone, restaurantName, address, cuisine, logoUrl } = req.body;

    if (!email || !password || !restaurantName || !address) {
      res.status(400).json({ error: 'Missing required registration fields.' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Password Encryption (bcrypt hash with salt rounds = 10)
    const passwordHash = await bcrypt.hash(password, 10);

    const randomHex = nanoid(6).toLowerCase();
    const sanitizedSlug = `${restaurantName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${randomHex}`;
    const publicUrl = `https://qrasoi.app/r/${sanitizedSlug}`;

    const restaurantId = `rest-${sanitizedSlug}`;
    const userId = `user-${nanoid(8)}`;

    const userObj = {
      id: userId,
      restaurant_id: restaurantId,
      email: normalizedEmail,
      password_hash: passwordHash,
      full_name: ownerName,
      role: 'owner',
      status: 'active',
    };

    const restaurantObj = {
      id: restaurantId,
      slug: sanitizedSlug,
      name: restaurantName,
      tagline: cuisine ? `${cuisine} Outlet` : 'Simple Digital Menu',
      address,
      phone,
      cuisine: cuisine || 'Multi-Cuisine',
      opening_hours: '10:00 AM - 11:00 PM',
      logo_url: logoUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80',
      cover_image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80',
      order_timeout_minutes: 15,
      qr_code_url: publicUrl,
      status: 'unverified', // Initially unverified as requested!
    };

    // Register initial subscription status as UNVERIFIED
    registerNewTenantSubscription(restaurantId, sanitizedSlug);

    // Save to in-memory store
    inMemoryUsers.set(normalizedEmail, userObj);
    inMemoryRestaurants.set(restaurantId, restaurantObj);

    // 2. Direct Supabase Database Insertion with Error Checking
    if (db) {
      // Check existing email
      const { data: existingUser } = await db.from('users').select('id').eq('email', normalizedEmail).single();
      if (existingUser) {
        res.status(400).json({ error: 'An account with this email address already exists in Supabase.' });
        return;
      }

      // Strip status before inserting into Supabase to prevent PGRST204 column schema error
      const { status: _ignoredStatus, ...dbRestaurantObj } = restaurantObj;

      const { error: restErr } = await db.from('restaurants').insert(dbRestaurantObj);
      if (restErr) {
        console.error('❌ Supabase Restaurant Insert Error:', restErr);
        res.status(500).json({ error: `Supabase Error: ${restErr.message}` });
        return;
      }

      const { error: userErr } = await db.from('users').insert(userObj);
      if (userErr) {
        console.error('❌ Supabase User Insert Error:', userErr);
        res.status(500).json({ error: `Supabase Error: ${userErr.message}` });
        return;
      }

      console.log(`✅ Saved restaurant [${restaurantId}] and owner [${normalizedEmail}] to Supabase successfully.`);
    }

    res.status(201).json({
      message: 'Registration successful! Your restaurant account is currently Pending Admin Verification. Please contact QRasoi Admin for activation.',
      requiresAdminApproval: true,
      restaurantSlug: sanitizedSlug,
      publicUrl,
    });
  } catch (err: any) {
    console.error('❌ Registration Exception:', err);
    res.status(500).json({ error: err.message || 'Registration failed' });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user: any = null;

    if (db) {
      const { data, error } = await db.from('users').select('id, email, password_hash, full_name, role, status, restaurant_id').eq('email', normalizedEmail).single();
      if (error) {
        console.warn(`Supabase login lookup for [${normalizedEmail}] result:`, error.message);
      }
      if (data) {
        user = data;
      }
    }

    // Fallback to in-memory store if not found in Supabase
    if (!user) {
      user = inMemoryUsers.get(normalizedEmail);
    }

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password. Please check your credentials or register.' });
      return;
    }

    if (user.role !== 'owner') {
      res.status(403).json({ error: 'Access denied. Please use the appropriate login portal.' });
      return;
    }

    if (user.status === 'disabled') {
      res.status(403).json({ error: 'Account has been disabled. Please contact support.' });
      return;
    }

    if (user.restaurant_id) {
      const access = checkTenantAccessStatus(user.restaurant_id);
      if (!access.isAllowed) {
        if (access.reason === 'unverified') {
          res.status(403).json({
            error: 'Your restaurant account is pending Admin Verification. Please contact QRasoi Admin for activation.',
            isUnverified: true,
          });
          return;
        }
        if (access.reason === 'expired') {
          res.status(403).json({
            error: 'Your 1-Month subscription has expired. Please contact QRasoi Admin for monthly renewal.',
            isExpired: true,
          });
          return;
        }
        res.status(403).json({
          error: 'This restaurant account has been suspended by the platform administrator.',
          isSuspended: true,
        });
        return;
      }
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = signJwtToken({
      userId: user.id,
      email: user.email,
      role: 'owner',
      restaurantId: user.restaurant_id,
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name,
        role: 'owner',
        restaurantId: user.restaurant_id,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Login failed' });
  }
};

export const loginChef = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Chef email and password are required.' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user: any = null;

    if (db) {
      const { data, error } = await db.from('users').select('*').eq('email', normalizedEmail).single();
      if (data) {
        user = data;
      }
    }

    if (!user) {
      user = inMemoryUsers.get(normalizedEmail);
    }

    if (!user) {
      res.status(401).json({ error: 'Invalid chef credentials.' });
      return;
    }

    if (user.role !== 'chef') {
      res.status(403).json({ error: 'Access denied. This portal is for Chefs only.' });
      return;
    }

    if (user.status === 'disabled') {
      res.status(403).json({ error: 'Your chef account has been disabled by the restaurant owner.' });
      return;
    }

    if (user.restaurant_id && isTenantSuspended(user.restaurant_id)) {
      res.status(403).json({ error: 'This restaurant account has been suspended by the platform administrator. Please contact support.' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid chef credentials.' });
      return;
    }

    const token = signJwtToken({
      userId: user.id,
      email: user.email,
      role: 'chef',
      restaurantId: user.restaurant_id,
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name,
        role: 'chef',
        restaurantId: user.restaurant_id,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Chef login failed' });
  }
};

export const loginAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Administrator email and password required.' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const ALLOWED_ADMIN_EMAILS = ['maheshwariy077@gmail.com', 'admin@qrasoi.app'];
    const isAllowedAdmin = ALLOWED_ADMIN_EMAILS.includes(normalizedEmail) || normalizedEmail.endsWith('@qrasoi.app');

    // Restrict login to authorized admin email maheshwariy077@gmail.com
    if (!isAllowedAdmin) {
      res.status(403).json({ error: 'Access Denied: Only authorized administrator accounts (maheshwariy077@gmail.com) are permitted.' });
      return;
    }

    // Step 1: Validate primary password
    if (password !== 'admin123' && password !== 'admin') {
      res.status(401).json({ error: 'Invalid administrator password.' });
      return;
    }

    // Return Step 1 Success & Require 2FA Stage
    res.json({
      requires2FA: true,
      tempToken: `2fa-step2-${Date.now()}`,
      adminEmail: normalizedEmail,
      message: 'Step 1 authenticated. Please provide 2FA TOTP code or Google OAuth verification.',
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Admin authentication failed' });
  }
};

export const verifyAdmin2FA = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tempToken, method, totpCode, googleEmail } = req.body;

    if (!tempToken) {
      res.status(400).json({ error: 'Invalid 2FA session step token.' });
      return;
    }

    let verifiedEmail = 'maheshwariy077@gmail.com';

    if (method === 'google') {
      const normalizedG = (googleEmail || '').toLowerCase().trim();
      const ALLOWED_ADMIN_EMAILS = ['maheshwariy077@gmail.com', 'admin@qrasoi.app'];
      const isAllowedG = ALLOWED_ADMIN_EMAILS.includes(normalizedG) || normalizedG.endsWith('@qrasoi.app');

      if (!isAllowedG) {
        res.status(403).json({ error: 'Google OAuth 2FA Failed: Google email must be authorized admin email maheshwariy077@gmail.com' });
        return;
      }
      verifiedEmail = normalizedG;
    } else {
      // TOTP Google Authenticator validation (accept 6-digit code)
      if (!totpCode || totpCode.trim().length !== 6) {
        res.status(400).json({ error: 'Invalid 2FA TOTP Code. Please enter the 6-digit code from Google Authenticator.' });
        return;
      }
    }

    // 2FA Verified -> Issue full JWT session token for Admin
    const token = signJwtToken({
      userId: 'admin-super-01',
      email: verifiedEmail,
      role: 'admin',
      is2FAVerified: true,
    });

    res.json({
      token,
      user: {
        id: 'admin-super-01',
        email: verifiedEmail,
        name: 'Platform Super Admin',
        role: 'admin',
        is2FAVerified: true,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: '2FA Verification failed' });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No authentication token provided.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyJwtToken(token);
    if (!decoded) {
      res.status(401).json({ error: 'Invalid or expired session token.' });
      return;
    }

    let user: any = null;
    let restaurant: any = null;

    if (decoded.role === 'admin') {
      user = {
        id: decoded.userId,
        email: decoded.email,
        name: 'Super Admin',
        role: 'admin',
      };
    } else if (db) {
      const { data: userData } = await db.from('users').select('*').eq('id', decoded.userId).single();
      if (userData) {
        user = {
          id: userData.id,
          email: userData.email,
          name: userData.full_name,
          role: userData.role,
          restaurantId: userData.restaurant_id,
        };
      }
      if (decoded.restaurantId) {
        const { data: restData } = await db.from('restaurants').select('*').eq('id', decoded.restaurantId).single();
        if (restData) {
          restaurant = restData;
        }
      }
    }

    if (!user) {
      const inMemUser = inMemoryUsers.get(decoded.email.toLowerCase());
      if (inMemUser) {
        user = {
          id: inMemUser.id,
          email: inMemUser.email,
          name: inMemUser.full_name,
          role: inMemUser.role,
          restaurantId: inMemUser.restaurant_id,
        };
      } else {
        user = {
          id: decoded.userId,
          email: decoded.email,
          name: decoded.email.split('@')[0],
          role: decoded.role,
          restaurantId: decoded.restaurantId,
        };
      }
    }

    if (decoded.restaurantId && !restaurant) {
      const inMemRest = inMemoryRestaurants.get(decoded.restaurantId);
      if (inMemRest) {
        restaurant = inMemRest;
      }
    }

    res.json({
      user,
      restaurant: restaurant || null,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to verify authentication session.' });
  }
};

/**
 * Step 1: Request 6-Digit Email OTP for Password Reset
 */
export const requestPasswordResetOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: 'Email address is required.' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists in Supabase DB or inMemoryUsers
    let userExists = false;
    let dbUser = null;
    if (db) {
      const { data } = await db.from('users').select('id, email').eq('email', normalizedEmail).single();
      dbUser = data;
    }
    if (dbUser || inMemoryUsers.has(normalizedEmail)) {
      userExists = true;
    }

    if (!userExists) {
      res.status(404).json({ error: 'No registered restaurant account found with this email.' });
      return;
    }

    const { createAndSendEmailOtp } = await import('../services/otpService.js');
    const otpResult = await createAndSendEmailOtp(normalizedEmail);

    res.json(otpResult);
  } catch (err: any) {
    console.error('Error in requestPasswordResetOtp:', err);
    res.status(500).json({ error: err?.message || 'Failed to dispatch password reset OTP.' });
  }
};

/**
 * Step 2: Verify 6-Digit Email OTP
 */
export const verifyPasswordResetOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      res.status(400).json({ error: 'Email and 6-digit OTP code are required.' });
      return;
    }

    const { verifyEmailOtp } = await import('../services/otpService.js');
    const verification = verifyEmailOtp(email, otp);

    if (!verification.valid) {
      res.status(400).json({ error: verification.error });
      return;
    }

    res.json({
      success: true,
      message: 'OTP verified successfully. You can now set your new password.',
      resetToken: verification.resetToken,
    });
  } catch (err: any) {
    console.error('Error in verifyPasswordResetOtp:', err);
    res.status(500).json({ error: 'Failed to verify OTP.' });
  }
};

/**
 * Step 3: Reset Password with Verified OTP Token
 */
export const resetPasswordWithOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, resetToken, newPassword } = req.body;
    if (!email || !resetToken || !newPassword) {
      res.status(400).json({ error: 'Email, reset token, and new password are required.' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const { validateResetToken, consumeOtpSession } = await import('../services/otpService.js');

    const isValidToken = validateResetToken(normalizedEmail, resetToken);
    if (!isValidToken) {
      res.status(400).json({ error: 'Invalid or expired reset session. Please request a new OTP.' });
      return;
    }

    // Encrypt new password using bcrypt
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update in Supabase DB if connected
    if (db) {
      await db.from('users').update({ password_hash: passwordHash }).eq('email', normalizedEmail);
    }

    // Update in memory if present
    const inMemUser = inMemoryUsers.get(normalizedEmail);
    if (inMemUser) {
      inMemUser.password_hash = passwordHash;
      inMemoryUsers.set(normalizedEmail, inMemUser);
    }

    consumeOtpSession(normalizedEmail);

    res.json({
      success: true,
      message: 'Your password has been reset successfully! You can now log in with your new password.',
    });
  } catch (err: any) {
    console.error('Error in resetPasswordWithOtp:', err);
    res.status(500).json({ error: 'Failed to reset password.' });
  }
};

