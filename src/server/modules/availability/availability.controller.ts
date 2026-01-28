import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../../types';
import { errorResponse, successResponse } from '../../../utils/helper';
import  AvailabilityService  from './availability.services';

export class AvailabilityController {
  /**
   * Add availability slot
   */
  async addAvailability(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(errorResponse('Not authenticated'));
        return;
      }

      const availability = await AvailabilityService.addAvailability(req.user.id, req.body);
      res.status(201).json(successResponse(availability, 'Availability added successfully'));
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }

  /**
   * Get tutor availability
   */
  async getTutorAvailability(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tutorId } = req.params;
      const availability = await AvailabilityService.getTutorAvailability(tutorId as string);
      res.json(successResponse(availability));
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }

  /**
   * Get own availability
   */
  async getOwnAvailability(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(errorResponse('Not authenticated'));
        return;
      }

      const availability = await AvailabilityService.getTutorAvailability(req.user.id);
      res.json(successResponse(availability));
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }

  /**
   * Update availability slot
   */
  async updateAvailability(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(errorResponse('Not authenticated'));
        return;
      }

      const { availabilityId } = req.params;
      const availability = await AvailabilityService.updateAvailability(
        availabilityId as string,
        req.user.id,
        req.body
      );
      res.json(successResponse(availability, 'Availability updated successfully'));
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }

  /**
   * Delete availability slot
   */
  async deleteAvailability(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(errorResponse('Not authenticated'));
        return;
      }

      const { availabilityId } = req.params;
      const result = await AvailabilityService.deleteAvailability(availabilityId as string, req.user.id);
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
   * Toggle availability slot
   */
  async toggleAvailability(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(errorResponse('Not authenticated'));
        return;
      }

      const { availabilityId } = req.params;
      const availability = await AvailabilityService.toggleAvailability(
        availabilityId as string,
        req.user.id
      );
      res.json(successResponse(availability, 'Availability status updated successfully'));
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }

  /**
   * Bulk add availability
   */
  async bulkAddAvailability(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(errorResponse('Not authenticated'));
        return;
      }

      const { slots } = req.body;
      const result = await AvailabilityService.bulkAddAvailability(req.user.id, slots);
      res.status(201).json(successResponse(result, 'Availability slots added successfully'));
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }
}

export default new AvailabilityController();
