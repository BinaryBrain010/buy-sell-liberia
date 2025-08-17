import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { secretKey } from "../enviroment/enviroment";

// Express.js authentication middleware (for use with Express routes only)
// Note: This is for Express.js applications, not Next.js API routes
export const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : authHeader?.split(" ")[1];
    
    if (!token) {
      res.status(401).json({ error: "Unauthorized - No token provided" });
      return;
    }

    jwt.verify(token, secretKey, (err: any, decoded: any) => {
      if (err) {
        console.error("JWT verification error:", err.message);
        res.status(403).json({ error: "Invalid or expired token" });
        return;
      }
      
      // Add user information to request object
      (req as any).user = decoded;
      next();
    });
  } catch (error) {
    console.error("Authentication middleware error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Optional authentication middleware (doesn't require token but adds user if present)
export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : authHeader?.split(" ")[1];
    
    if (!token) {
      next(); // Continue without user
      return;
    }

    jwt.verify(token, secretKey, (err: any, decoded: any) => {
      if (err) {
        console.warn("Invalid token in optional auth:", err.message);
        next(); // Continue without user
        return;
      }
      
      (req as any).user = decoded;
      next();
    });
  } catch (error) {
    console.error("Optional authentication middleware error:", error);
    next(); // Continue without user on error
  }
};
