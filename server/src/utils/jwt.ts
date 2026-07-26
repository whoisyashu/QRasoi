import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'owner' | 'chef' | 'admin';
  restaurantId?: string;
  is2FAVerified?: boolean;
}

export const signJwtToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: '7d' });
};

export const verifyJwtToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, ENV.JWT_SECRET) as TokenPayload;
  } catch (err) {
    return null;
  }
};
