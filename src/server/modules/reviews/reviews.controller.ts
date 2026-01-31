import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../../types';
import { errorResponse, successResponse } from '../../../utils/helper';
import  ReviewService  from './reviews.services';

export class ReviewController {
  /**
   * Create a review
   */
async createReview(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const { bookingId, rating, comment } = req.body;
      const studentId = req.user.id;

      const review = await ReviewService.createReview({
        bookingId,
        rating,
        comment,
        studentId,
      });

      res.status(201).json({
        success: true,
        data: review,
      });
    } catch (error) {
      next(error);
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
  async getTutorReviews(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { tutorId } = req.params;
      const { page = '1', limit = '10' } = req.query;

      const result = await ReviewService.getTutorReviews(
        tutorId as string,
        Number(page),
        Number(limit)
      );

      res.json({
        success: true,
        data: result,
      });
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
