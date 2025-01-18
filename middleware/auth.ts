import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

// Define AuthRequest interface to extend the Request object with a `user` property
export interface AuthRequest extends Request {
  user?: JwtPayload | string; // Use proper types instead of `any`
}

// Authentication middleware
export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];

    // Check if the authorization header exists and has the correct format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Authorization header missing or invalid' });
      return;
    }

    // Extract the token
    const token = authHeader.split(' ')[1];

    // Ensure the secret exists
    const secret = process.env.SECRET_TOKEN;
    if (!secret) {
      throw new Error('SECRET_TOKEN environment variable not set');
    }

    // Verify the token
    const user = jwt.verify(token, secret) as JwtPayload | string;
    req.user = user; // Attach user info to the request object

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      // Handle JWT-specific errors
      res.status(403).json({ message: 'Invalid token' });
      return;
    }
    // Handle other unexpected errors
    res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
  }
};
