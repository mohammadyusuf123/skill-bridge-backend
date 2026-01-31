import { Response, NextFunction } from 'express';
import { AuthRequest, GetUsersFilters } from '../../../types';
import { errorResponse, successResponse } from '../../../utils/helper';
import  UserService  from './user.services';


export class UserController {
  /**
   * Get current user profile
   */
  async getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(errorResponse('Not authenticated'));
        return;
      }

      const user = await UserService.getUserById(req.user.id);
      res.json(successResponse(user));
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const user = await UserService.getUserById(userId as string);
      res.json(successResponse(user));
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(errorResponse('Not authenticated'));
        return;
      }

      const user = await UserService.updateProfile(req.user.id, req.body);
      res.json(successResponse(user, 'Profile updated successfully'));
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }

  /**
   * Get all users (Admin only)
   */
 async getAllUsers(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { role, status } = req.query;

      const filters = {
        role: role as string | undefined,
        status: status as string | undefined,
      };

      const users = await UserService.getAllUsers(filters);

      // IMPORTANT: return array directly
      res.json({
        success: true,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  }



  /**
   * Delete user (Admin only)
   */
  async deleteUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const result = await UserService.deleteUser(userId as string);
      res.json(successResponse(result));
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }

  /**
   * Update user role (Admin only)
   */
  async updateUserRole(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const { role } = req.body;
      const user = await UserService.updateUserRole(userId as string, role);
      res.json(successResponse(user, 'User role updated successfully'));
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }

  /**
   * Update user status (Admin only)
   */
  async updateUserStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const { status } = req.body;
      const user = await UserService.updateUserStatus(userId as string, status);
      res.json(successResponse(user, 'User status updated successfully'));
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }
}

export default new UserController();
