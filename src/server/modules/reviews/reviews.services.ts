import { prisma } from "../../../lib/prisma";
import { CreateReviewInput } from "../../../types";


export class ReviewService {
  /**
   * Create a review
   */
async createReview(input: CreateReviewInput) {
    const { bookingId, studentId, rating, comment } = input;

    // 1️⃣ Verify booking exists, belongs to student, and is completed
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        studentId,
        status: 'COMPLETED',
      },
      include: {
        tutor: true, // get tutorId
      },
    });

    if (!booking) {
      throw {
        status: 404,
        message: 'Booking not found or not completed',
      };
    }

    // 2️⃣ Check if review already exists
    const existingReview = await prisma.review.findUnique({
      where: { bookingId },
    });

    if (existingReview) {
      throw {
        status: 400,
        message: 'Review already exists for this booking',
      };
    }

    // 3️⃣ Create review
    return prisma.review.create({
      data: {
        bookingId,
        studentId,
        tutorId: booking.tutorId, // ✅ corrected field
        rating,
        comment,
      },
      include: {
        student: true,
        tutor: true,
      },
    });
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
 async getTutorReviews(
    tutorId: string,
    page: number,
    limit: number
  ) {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { tutorId }, // ✅ corrected field
        include: {
          student: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.review.count({
        where: { tutorId }, // ✅ corrected field
      }),
    ]);

    return {
      data: reviews,
      meta: {
        total,
        page,
        limit,
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
