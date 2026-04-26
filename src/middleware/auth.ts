import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
  admin?: { role: string };
}

const JWT_SECRET = process.env.JWT_SECRET || 'dealnamaa_secure_token_123!';

export const verifyAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(403).json({ error: 'Access Denied: No Token' });
    return;
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { role: string };
    (req as AuthRequest).admin = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid Token' });
  }
};

export const generateToken = (payload: object): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });
};
