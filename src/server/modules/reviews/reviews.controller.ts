import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../../types';
import { errorResponse, successResponse } from '../../../utils/helper';
import  ReviewService  from './reviews.services';

export class ReviewController {
  /**
   * Create a review
   */
  async createReview(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(errorResponse('Not authenticated'));
        return;
      }

      const review = await ReviewService.createReview(req.user.id, req.body);
      res.status(201).json(successResponse(review, 'Review created successfully'));
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }

  /**
   * Get review by ID
   */
  async getReviewById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { reviewId } = req.params;
      const review = await ReviewService.getReviewById(reviewId as string);
      res.json(successResponse(review));
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }

  /**
   * Get tutor reviews
   */
  async getTutorReviews(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tutorId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await ReviewService.getTutorReviews(tutorId as string, page, limit);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Respond to a review (Tutor only)
   */
  async respondToReview(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(errorResponse('Not authenticated'));
        return;
      }

      const { reviewId } = req.params;
      const { response } = req.body;

      const review = await ReviewService.respondToReview(reviewId as string, req.user.id, response);
      res.json(successResponse(review, 'Response added successfully'));
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }

  /**
   * Delete review (Admin only)
   */
  async deleteReview(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { reviewId } = req.params;
      const result = await ReviewService.deleteReview(reviewId as string);
      res.json(successResponse(result));
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json(errorResponse(error.message));
      } else {
        next(error);
      }
    }
  }
}

export default new ReviewController();
