import { Request, Response, NextFunction } from 'express';
import { verifyJwtToken, TokenPayload } from '../utils/jwt.js';
import { checkTenantAccessStatus } from '../utils/suspendedTenants.js';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized. Authorization Bearer token required.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyJwtToken(token);

  if (!payload) {
    res.status(401).json({ error: 'Unauthorized. Invalid or expired token.' });
    return;
  }

  // If user belongs to a restaurant (owner / chef) and is not super admin, check if tenant access is allowed!
  if (payload.role !== 'admin' && payload.restaurantId) {
    const access = checkTenantAccessStatus(payload.restaurantId);
    if (!access.isAllowed) {
      if (access.reason === 'unverified') {
        res.status(403).json({
          error: 'Your restaurant account is pending Admin Verification. Please contact QRasoi Admin.',
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
        error: 'This restaurant account has been suspended by the platform administrator. Access disabled.',
        isSuspended: true,
      });
      return;
    }
  }

  req.user = payload;
  next();
};

export const authenticate = authenticateToken;

export const requireRoles = (allowedRoles: Array<'owner' | 'chef' | 'admin'>) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: 'Forbidden. Insufficient role permissions.' });
      return;
    }
    next();
  };
};
