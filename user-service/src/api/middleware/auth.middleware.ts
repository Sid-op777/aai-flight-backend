import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../../models/User.model';
import { IAuthRequest } from '../controllers/user.controller';

interface JwtPayload {
  id: string;
}

export const authMiddleware = async (req: IAuthRequest, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.user = await User.findById(decoded.id).select('-passwordHash');
    if (!req.user) {
      return res.status(401).json({ message: 'User not found.' });
    }
    next();
  } catch (ex) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};