import { Request, Response, NextFunction } from 'express';
import { getOrCreateUser } from '../db/users.ts';

export interface AuthRequest extends Request {
  user?: any;
  dbUser?: any;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    if (token !== 'secret-local-token') {
      throw new Error('Invalid token');
    }
    
    // Sync to DB
    const dbUser = await getOrCreateUser('local-eko', 'eko@local.dev');
    req.dbUser = dbUser;
    
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
