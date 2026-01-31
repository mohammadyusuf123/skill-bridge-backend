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
 //get all tutors
 async getAllTutors(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const tutors = await TutorService.getAllTutors();
      res.json(successResponse(tutors));
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json(errorResponse(error.message));
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

      const profile = await TutorService.getTutorProfileByUserId(req.user.id);
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
  async getTutorProfileByUserId(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { userId } = req.params;

      const tutorProfile =
        await TutorService.getTutorProfileByUserId(userId as string);

      if (!tutorProfile) {
        return res.status(404).json({
          success: false,
          message: 'Tutor profile not found',
        });
      }

      res.json({
        success: true,
        data: tutorProfile,
      });
    } catch (error) {
      next(error);
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
// async searchTutors(req: AuthRequest, res: Response, next: NextFunction) {
//     try {
//       const {
//         categoryId,
//         search,
//         minRate,
//         maxRate,
//         minRating,
//         page = 1,
//         limit = 12,
//       } = req.query;

//       const filters = {
//         categoryId: categoryId as string | undefined,
//         search: search as string | undefined,
//         minRate: minRate ? Number(minRate) : undefined,
//         maxRate: maxRate ? Number(maxRate) : undefined,
//         minRating: minRating ? Number(minRating) : undefined,
//       };

//       const result = await TutorService.searchTutors(
//         filters,
//         Number(page),
//         Number(limit)
//       );

//       res.json({
//         success: true,
//         data: result,
//       });
//     } catch (error) {
//       next(error);
//     }
//   }
async searchTutors(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await TutorService.searchTutors(req.query);

      res.json({
        success: true,
        data: result,
      });
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
