import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Custom request interface to include our userId property
export interface IAuthRequest extends Request {
  userId?: string;
}

// Define the shape of the decoded JWT payload
interface JwtPayload {
  id: string;
}

export const authMiddleware = (req: IAuthRequest, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  // Ensure the JWT_SECRET is available
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('FATAL ERROR: JWT_SECRET is not defined.');
    return res.status(500).json({ message: 'Internal server error: JWT secret not configured.' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    
    // Attach the user ID from the token payload to the request object
    req.userId = decoded.id; 
    
    next();
  } catch (ex) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};