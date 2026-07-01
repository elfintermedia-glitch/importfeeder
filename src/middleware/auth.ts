import { Request, Response, NextFunction } from 'express';
import { db } from '../db/index.ts';
import { users } from '../db/schema.ts';
import { eq } from 'drizzle-orm';

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
    let tokenStr = '';
    try {
      tokenStr = Buffer.from(token, 'base64').toString('ascii');
    } catch (e) {
      throw new Error('Invalid token format');
    }

    if (!tokenStr.startsWith('user:')) {
      throw new Error('Invalid token');
    }

    const uid = tokenStr.split('user:')[1];
    
    // Fetch user from DB
    const dbUser = await db.query.users.findFirst({
      where: eq(users.uid, uid)
    });
    
    if (!dbUser) {
      throw new Error('User not found');
    }

    req.dbUser = dbUser;
    
    next();
  } catch (error: any) {
    if (error.message === 'Invalid token' || error.message === 'User not found') {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    
    console.error('Error in requireAuth middleware:', error);
    if (error.cause) {
      console.error('Error cause:', error.cause);
    }
    return res.status(500).json({ error: 'Database Error: ' + (error.cause ? error.cause.message : error.message) });
  }
};
