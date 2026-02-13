import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../../types';
import { errorResponse, successResponse } from '../../../utils/helper';
import  DashboardService  from './dashboard.services';


export class DashboardController {
  /**
   * Get student dashboard
   */
  async getStudentDashboard(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(errorResponse('Not authenticated'));
        return;
      }

      if (req.user.role !== 'STUDENT') {
        res.status(403).json(errorResponse('Access denied. Students only.'));
        return;
      }

      const dashboard = await DashboardService.getStudentDashboard(req.user.id);
      res.json(successResponse(dashboard));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get tutor dashboard
   */
  async getTutorDashboard(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  
    try {
      if (!req.user) {
        res.status(401).json(errorResponse('Not authenticated'));
        return;
      }

      if (req.user.role !== 'TUTOR' && req.user.role !== 'ADMIN') {
        res.status(403).json(errorResponse('Access denied. Tutors only.'));
        return;
      }

      const dashboard = await DashboardService.getTutorDashboard(req.user.id);
      res.json(successResponse(dashboard));
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }

  /**
   * Get admin dashboard
   */
  async getAdminDashboard(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(errorResponse('Not authenticated'));
        return;
      }

      if (req.user.role !== 'ADMIN') {
        res.status(403).json(errorResponse('Access denied. Admins only.'));
        return;
      }

      const dashboard = await DashboardService.getAdminDashboard();
      res.json(successResponse(dashboard));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get booking statistics by date range
   */
  async getBookingStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(errorResponse('Not authenticated'));
        return;
      }

      const startDate = req.query.startDate 
        ? new Date(req.query.startDate as string)
        : new Date(new Date().setDate(new Date().getDate() - 30));
      
      const endDate = req.query.endDate
        ? new Date(req.query.endDate as string)
        : new Date();

      const tutorId = req.user.role === 'TUTOR' ? req.user.id : undefined;

      const stats = await DashboardService.getBookingStatsByDateRange(
        startDate,
        endDate,
        tutorId
      );
      
      res.json(successResponse(stats));
    } catch (error) {
      next(error);
    }
  }
}

export default new DashboardController();
