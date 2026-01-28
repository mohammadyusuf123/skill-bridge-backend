import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../../types';
import TutorService from './tutors.services';
import { successResponse, errorResponse } from '../../../utils/helper';

export class TutorController {
  /**
   * Create tutor profile
   */
  async createProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(errorResponse('Not authenticated'));
        return;
      }

      const profile = await TutorService.createProfile(req.user.id, req.body);
      res.status(201).json(successResponse(profile, 'Tutor profile created successfully'));
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }

  /**
   * Get own tutor profile
   */
  async getOwnProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(errorResponse('Not authenticated'));
        return;
      }

      const profile = await TutorService.getProfileByUserId(req.user.id);
      res.json(successResponse(profile));
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }

  /**
   * Get tutor profile by user ID
   */
  async getProfileByUserId(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const profile = await TutorService.getProfileByUserId(userId as string);
      res.json(successResponse(profile));
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }

  /**
   * Get tutor profile by ID
   */
  async getProfileById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tutorId } = req.params;
      const profile = await TutorService.getProfileById(tutorId as string);
      res.json(successResponse(profile));
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }

  /**
   * Update tutor profile
   */
  async updateProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(errorResponse('Not authenticated'));
        return;
      }

      const profile = await TutorService.updateProfile(req.user.id, req.body);
      res.json(successResponse(profile, 'Profile updated successfully'));
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }

  /**
   * Search tutors
   */
  async searchTutors(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const sortBy = (req.query.sortBy as string) || 'averageRating';

      const filters = {
        categoryId: req.query.categoryId as string | undefined,
        minRate: req.query.minRate ? parseFloat(req.query.minRate as string) : undefined,
        maxRate: req.query.maxRate ? parseFloat(req.query.maxRate as string) : undefined,
        minRating: req.query.minRating ? parseFloat(req.query.minRating as string) : undefined,
        isAvailable: req.query.isAvailable === 'true',
        search: req.query.search as string | undefined,
      };

      const result = await TutorService.searchTutors(filters, page, limit, sortBy);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Toggle tutor availability
   */
  async toggleAvailability(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(errorResponse('Not authenticated'));
        return;
      }

      const profile = await TutorService.toggleAvailability(req.user.id);
      res.json(successResponse(profile, 'Availability updated successfully'));
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }
}

export default new TutorController();
