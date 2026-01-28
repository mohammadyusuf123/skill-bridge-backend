import { Prisma } from '../../../../generated/prisma/client';
import { prisma } from '../../../lib/prisma';
import { CreateTutorProfileDto, UpdateTutorProfileDto, TutorFilters } from '../../../types';

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

  /**
   * Get tutor profile by user ID
   */
  async getProfileByUserId(userId: string) {
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId },
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
  async searchTutors(
    filters: TutorFilters,
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'averageRating'
  ) {
    const skip = (page - 1) * limit;

    const where: Prisma.TutorProfileWhereInput = {
      isAvailable: filters.isAvailable ?? true,
    };

    // Category filter
    if (filters.categoryId) {
      where.categories = {
        some: {
          categoryId: filters.categoryId,
        },
      };
    }

    // Rate filters
    if (filters.minRate !== undefined || filters.maxRate !== undefined) {
      where.hourlyRate = {};
      if (filters.minRate !== undefined) {
        where.hourlyRate.gte = filters.minRate;
      }
      if (filters.maxRate !== undefined) {
        where.hourlyRate.lte = filters.maxRate;
      }
    }

    // Rating filter
    if (filters.minRating !== undefined) {
      where.averageRating = {
        gte: filters.minRating,
      };
    }

    // Search filter
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { headline: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        {
          user: {
            name: { contains: filters.search, mode: 'insensitive' },
          },
        },
      ];
    }

    // Sort options
    const orderBy: Prisma.TutorProfileOrderByWithRelationInput[] = [];
    switch (sortBy) {
      case 'averageRating':
        orderBy.push({ averageRating: 'desc' });
        break;
      case 'hourlyRate':
        orderBy.push({ hourlyRate: 'asc' });
        break;
      case 'totalSessions':
        orderBy.push({ totalSessions: 'desc' });
        break;
      default:
        orderBy.push({ createdAt: 'desc' });
    }

    const [tutors, total] = await Promise.all([
      prisma.tutorProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          user: {
            select: {
              id: true,
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
      }),
      prisma.tutorProfile.count({ where }),
    ]);

    return {
      data: tutors,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
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
