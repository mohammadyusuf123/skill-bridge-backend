import { Response, NextFunction } from 'express';
import { AuthRequest, AuthUser } from '../../types';
import { errorResponse } from '../../utils/helper';
import { auth } from '../auth';

/**
 * User role enum
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  TUTOR = 'TUTOR',
  STUDENT = 'STUDENT',
}

/**
 * User status enum
 */
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  BANNED = 'BANNED',
  SUSPENDED = 'SUSPENDED',
}

/**
 * Type definitions for BetterAuth session user
 */
type SessionUserWithRole = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  emailVerified: boolean;
  status: UserStatus;
};

/**
 * Middleware to authenticate user via BetterAuth session
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const session = await auth.api.getSession({
      headers: req.headers as any,
    });

    if (!session) {
      res.status(401).json(errorResponse('No active session'));
      return;
    }

    const user = session.user as unknown as SessionUserWithRole;
   console.log("Authenticated user:", user);
    if (!user) {
      res.status(401).json(errorResponse('User not found'));
      return;
    }

    if (user.status !== UserStatus.ACTIVE) {
      res.status(403).json(errorResponse('Account is not active'));
      return;
    }

    // Optional: Check email verification
    // if (!user.emailVerified) {
    //   res.status(401).json(errorResponse('Email is not verified'));
    //   return;
    // }

    // Map to AuthUser type
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
    } as AuthUser;

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json(errorResponse('Authentication failed'));
  }
};

/**
 * Middleware to check if user has required role
 */
export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json(errorResponse('Not authenticated'));
      return;
    }

    if (!roles.includes(req.user.role as UserRole)) {
      res.status(403).json(errorResponse('Insufficient permissions'));
      return;
    }

    next();
  };
};

/**
 * Middleware to check if user is a tutor
 */
export const isTutor = authorize(UserRole.TUTOR, UserRole.ADMIN);

/**
 * Middleware to check if user is an admin
 */
export const isAdmin = authorize(UserRole.ADMIN);