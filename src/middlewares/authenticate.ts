import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1]; // Bearer <token>

    jwt.verify(token, process.env.JWT_SECRET as string, (err: any, decoded: any) => {
      if (err) {
        return res.sendStatus(403); // Invalid token
      }

      // Attach user info from token to request object
      req.user = decoded;
      next();
    });
  } else {
    res.sendStatus(401); // No token provided
  }
};