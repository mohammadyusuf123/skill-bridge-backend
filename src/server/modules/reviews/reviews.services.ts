import { prisma } from "../../../lib/prisma";
import { CreateReviewDto } from "../../../types";


export class ReviewService {
  /**
   * Create a review
   */
  async createReview(studentId: string, data: CreateReviewDto) {
    const { bookingId, rating, comment } = data;

    // Verify booking exists and belongs to student
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        review: true,
      },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.studentId !== studentId) {
      throw new Error('Not authorized to review this booking');
    }

    if (booking.status !== 'COMPLETED') {
      throw new Error('Can only review completed bookings');
    }

    if (booking.review) {
      throw new Error('Booking already has a review');
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        bookingId,
        studentId,
        tutorId: booking.tutorProfileId,
        rating,
        comment,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        booking: {
          select: {
            id: true,
            subject: true,
            sessionDate: true,
          },
        },
      },
    });

    // Update tutor's average rating and review count
    await this.updateTutorRating(booking.tutorProfileId);

    return review;
  }

  /**
   * Update tutor's average rating
   */
  private async updateTutorRating(tutorProfileId: string) {
    const reviews = await prisma.review.findMany({
      where: {
        tutorId: tutorProfileId,
        isVisible: true,
      },
      select: {
        rating: true,
      },
    });

    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
        : null;

    await prisma.tutorProfile.update({
      where: { id: tutorProfileId },
      data: {
        totalReviews,
        averageRating: averageRating ? parseFloat(averageRating.toFixed(2)) : null,
      },
    });
  }

  /**
   * Get review by ID
   */
  async getReviewById(reviewId: string) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        tutor: {
          select: {
            id: true,
            title: true,
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        booking: {
          select: {
            id: true,
            subject: true,
            sessionDate: true,
          },
        },
      },
    });

    if (!review) {
      throw new Error('Review not found');
    }

    return review;
  }

  /**
   * Get tutor reviews
   */
  async getTutorReviews(tutorId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: {
          tutorId,
          isVisible: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          booking: {
            select: {
              id: true,
              subject: true,
              sessionDate: true,
            },
          },
        },
      }),
      prisma.review.count({
        where: {
          tutorId,
          isVisible: true,
        },
      }),
    ]);

    return {
      data: reviews,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Add tutor response to review
   */
  async respondToReview(reviewId: string, tutorUserId: string, response: string) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        tutor: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!review) {
      throw new Error('Review not found');
    }

    if (review.tutor.userId !== tutorUserId) {
      throw new Error('Not authorized to respond to this review');
    }

    const updated = await prisma.review.update({
      where: { id: reviewId },
      data: {
        response,
        respondedAt: new Date(),
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Delete review (Admin only)
   */
  async deleteReview(reviewId: string) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new Error('Review not found');
    }

    // Soft delete - hide the review
    await prisma.review.update({
      where: { id: reviewId },
      data: {
        isVisible: false,
      },
    });

    // Update tutor's rating
    await this.updateTutorRating(review.tutorId);

    return { message: 'Review deleted successfully' };
  }
}

export default new ReviewService();
