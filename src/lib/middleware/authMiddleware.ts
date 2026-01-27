import { Request, Response, NextFunction } from "express";
import { auth } from "../../lib/auth";

// namespace
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string | null;
        role: string;
        emailVerified: boolean;
      };
    }
  }
}

export enum UserRole {
  ADMIN = "ADMIN",
  TUTOR = "TUTOR",
  STUDENT = "STUDENT",
}

type SessionUserWithRole = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  emailVerified: boolean;
};

// auth middleware
export const authMiddleware = (...roles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = await auth.api.getSession({
        headers: req.headers as any,
      });

      if (!session) {
        return res.status(401).json({
          success: false,
          message: "You are not authorized",
        });
      }

      const user = session.user as unknown as SessionUserWithRole;

      if (!user.emailVerified) {
        return res.status(401).json({
          success: false,
          message: "Email is not verified",
        });
      }

      if (roles.length && !roles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden",
        });
      }

      req.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: user.emailVerified,
      };

      next();
    } catch (error) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  };
};
