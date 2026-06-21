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
  } catch (error: any) {
    console.error('Error in requireAuth middleware:', error);
    if (error.message === 'Invalid token') {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    // Most likely a database connection or schema error
    return res.status(500).json({ error: 'Database Error: ' + error.message });
  }
};
