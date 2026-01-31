import { Prisma } from '../../../../generated/prisma/client';
import { prisma } from '../../../lib/prisma';
import { CreateTutorProfileDto, UpdateTutorProfileDto, TutorFilters, TutorSearchFilters } from '../../../types';

export class TutorService {
  /**
   * Create tutor profile
   */
  async createProfile(userId: string, data: CreateTutorProfileDto) {
    const { categoryIds, ...profileData } = data;

    // Check if user already has a tutor profile
    const existingProfile = await prisma.tutorProfile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      throw new Error('Tutor profile already exists');
    }

    // Update user role to TUTOR
    await prisma.user.update({
      where: { id: userId },
      data: { role: 'TUTOR' },
    });

    // Create tutor profile
    const tutorProfile = await prisma.tutorProfile.create({
      data: {
        ...profileData,
        userId,
        categories: {
          create: categoryIds.map((categoryId, index) => ({
            categoryId,
            isPrimary: index === 0, // First category is primary
          })),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    return tutorProfile;
  }
//get all tutors
  async getAllTutors() {
    const tutors = await prisma.tutorProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
      },
    });
    return tutors;
  }
  /**
   * Get tutor profile by user ID
   */
async getTutorProfileByUserId(userId: string) {
    return prisma.tutorProfile.findUnique({
      where: { userId },
      include: {
        user: true,
        categories: {
          include: {
            category: true,
          },
        },
      },
    });
  }


  /**
   * Get tutor profile by ID
   */
  async getProfileById(tutorId: string) {
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { id: tutorId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            bio: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
        availability: {
          where: { isActive: true },
          orderBy: { dayOfWeek: 'asc' },
        },
        reviews: {
          where: { isVisible: true },
          include: {
            student: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!tutorProfile) {
      throw new Error('Tutor profile not found');
    }

    return tutorProfile;
  }

  /**
   * Update tutor profile
   */
  async updateProfile(userId: string, data: UpdateTutorProfileDto) {
    const { categoryIds, ...profileData } = data;

    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId },
    });

    if (!tutorProfile) {
      throw new Error('Tutor profile not found');
    }

    // Update categories if provided
    if (categoryIds) {
      // Remove existing categories
      await prisma.tutorCategory.deleteMany({
        where: { tutorId: tutorProfile.id },
      });

      // Add new categories
      await prisma.tutorCategory.createMany({
        data: categoryIds.map((categoryId, index) => ({
          tutorId: tutorProfile.id,
          categoryId,
          isPrimary: index === 0,
        })),
      });
    }

    // Update profile
    const updatedProfile = await prisma.tutorProfile.update({
      where: { userId },
      data: profileData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    return updatedProfile;
  }

  /**
   * Search and filter tutors
   */

//  async searchTutors(
//     filters: TutorSearchFilters,
//     page: number,
//     limit: number
//   ) {
//     const where: any = {
//       isAvailable: true, // Always show available tutors
//     };

//     // Category filter
//     if (filters.categoryId) {
//       where.categories = {
//         some: {
//           categoryId: filters.categoryId,
//         },
//       };
//     }

//     // Search filter
//     if (filters.search) {
//       where.OR = [
//         { title: { contains: filters.search, mode: 'insensitive' } },
//         { description: { contains: filters.search, mode: 'insensitive' } },
//         {
//           user: {
//             name: { contains: filters.search, mode: 'insensitive' },
//           },
//         },
//       ];
//     }

//     // Hourly rate filter
//     if (filters.minRate || filters.maxRate) {
//       where.hourlyRate = {};
//       if (filters.minRate) where.hourlyRate.gte = filters.minRate;
//       if (filters.maxRate) where.hourlyRate.lte = filters.maxRate;
//     }

//     // Rating filter
//     if (filters.minRating) {
//       where.averageRating = { gte: filters.minRating };
//     }

//     const skip = (page - 1) * limit;

//     const [tutors, total] = await Promise.all([
//       prisma.tutorProfile.findMany({
//         where,
//         include: {
//           user: true,
//           categories: { include: { category: true } },
//         },
//         skip,
//         take: limit,
//         orderBy: { createdAt: 'desc' },
//       }),
//       prisma.tutorProfile.count({ where }),
//     ]);

//     return {
//       data: tutors,
//       meta: {
//         total,
//         page,
//         limit,
//         totalPages: Math.ceil(total / limit),
//       },
//     };
//   }
async searchTutors(query: any) {
    const {
      categoryId,
      search,
      minRate,
      maxRate,
      minRating,
      sortBy = 'createdAt',
      page = 1,
      limit = 12,
    } = query;

    const where: any = {
      isAvailable: true,
    };

    // Filters
    if (categoryId) {
      where.categories = {
        some: { categoryId },
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        {
          user: {
            name: { contains: search, mode: 'insensitive' },
          },
        },
      ];
    }

    if (minRate) {
      where.hourlyRate = { gte: Number(minRate) };
    }

    if (maxRate) {
      where.hourlyRate = {
        ...where.hourlyRate,
        lte: Number(maxRate),
      };
    }

    if (minRating) {
      where.averageRating = { gte: Number(minRating) };
    }

    // Sorting
    let orderBy: any = { createdAt: 'desc' };

    if (sortBy === 'averageRating') {
      orderBy = { averageRating: 'desc' };
    } else if (sortBy === 'hourlyRate') {
      orderBy = { hourlyRate: 'asc' };
    } else if (sortBy === 'totalSessions') {
      orderBy = { totalSessions: 'desc' };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [tutors, total] = await Promise.all([
      prisma.tutorProfile.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          categories: {
            include: { category: true },
          },
        },
        skip,
        take,
        orderBy,
      }),
      prisma.tutorProfile.count({ where }),
    ]);

    return {
      data: tutors,
      meta: {
        total,
        page: Number(page),
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  /**
   * Toggle tutor availability
   */
  async toggleAvailability(userId: string) {
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId },
    });

    if (!tutorProfile) {
      throw new Error('Tutor profile not found');
    }

    const updated = await prisma.tutorProfile.update({
      where: { userId },
      data: {
        isAvailable: !tutorProfile.isAvailable,
      },
    });

    return updated;
  }
}

export default new TutorService();
