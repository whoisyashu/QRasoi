import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { db } from '../config/db.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { inMemoryUsers } from './auth.controller.js';

export const getChefs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const restaurantId = req.user?.restaurantId;

    if (!restaurantId) {
      res.status(400).json({ error: 'Restaurant context missing.' });
      return;
    }

    if (db) {
      const { data: chefs, error } = await db
        .from('users')
        .select('id, full_name, email, role, status, created_at')
        .eq('restaurant_id', restaurantId)
        .eq('role', 'chef');

      if (!error && chefs && chefs.length > 0) {
        res.json({ chefs });
        return;
      }
    }

    // Fallback: Filter in-memory users for chefs of this restaurant
    const memoryChefs = Array.from(inMemoryUsers.values()).filter(
      (u) => u.restaurant_id === restaurantId && u.role === 'chef'
    );

    res.json({ chefs: memoryChefs });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch chefs' });
  }
};

export const createChef = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const restaurantId = req.user?.restaurantId;
    const { fullName, email, password } = req.body;

    if (!restaurantId) {
      res.status(400).json({ error: 'Restaurant context missing.' });
      return;
    }

    if (!fullName || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required.' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    if (inMemoryUsers.has(normalizedEmail)) {
      res.status(400).json({ error: 'A user with this email already exists.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const chefId = `chef-${nanoid(8)}`;

    const chefObj = {
      id: chefId,
      restaurant_id: restaurantId,
      email: normalizedEmail,
      password_hash: passwordHash,
      full_name: fullName,
      role: 'chef',
      status: 'active',
      created_at: new Date().toISOString(),
    };

    inMemoryUsers.set(normalizedEmail, chefObj);

    if (db) {
      try {
        await db.from('users').insert(chefObj);
      } catch (dbErr) {
        console.warn('Supabase DB chef insert notice:', dbErr);
      }
    }

    res.status(201).json({
      message: 'Chef account created successfully',
      chef: { id: chefId, full_name: fullName, email: normalizedEmail, role: 'chef', status: 'active' },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create chef' });
  }
};

export const updateChefStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const restaurantId = req.user?.restaurantId;
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'disabled'].includes(status)) {
      res.status(400).json({ error: 'Invalid status value.' });
      return;
    }

    for (const [key, u] of inMemoryUsers.entries()) {
      if (u.id === id && u.restaurant_id === restaurantId) {
        u.status = status;
        inMemoryUsers.set(key, u);
      }
    }

    if (db) {
      await db
        .from('users')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('restaurant_id', restaurantId)
        .eq('role', 'chef');
    }

    res.json({ message: `Chef status updated to ${status}` });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update chef' });
  }
};

export const resetChefPassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const restaurantId = req.user?.restaurantId;
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters.' });
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    for (const [key, u] of inMemoryUsers.entries()) {
      if (u.id === id && u.restaurant_id === restaurantId) {
        u.password_hash = passwordHash;
        inMemoryUsers.set(key, u);
      }
    }

    if (db) {
      await db
        .from('users')
        .update({ password_hash: passwordHash, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('restaurant_id', restaurantId)
        .eq('role', 'chef');
    }

    res.json({ message: 'Chef password reset successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to reset chef password' });
  }
};

export const deleteChef = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const restaurantId = req.user?.restaurantId;
    const { id } = req.params;

    for (const [key, u] of inMemoryUsers.entries()) {
      if (u.id === id && u.restaurant_id === restaurantId) {
        inMemoryUsers.delete(key);
      }
    }

    if (db) {
      await db
        .from('users')
        .delete()
        .eq('id', id)
        .eq('restaurant_id', restaurantId)
        .eq('role', 'chef');
    }

    res.json({ message: 'Chef account removed successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete chef' });
  }
};
