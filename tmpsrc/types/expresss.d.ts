import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      admin?: { role: string };
    }
  }
}
