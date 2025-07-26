import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface IAuthRequest extends Request {
  userId?: string;
}

interface JwtPayload {
  id: string;
}

export const authMiddleware = (req: IAuthRequest, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.userId = decoded.id; 
    next();
  } catch (ex) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};