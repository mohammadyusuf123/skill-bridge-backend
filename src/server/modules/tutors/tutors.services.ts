
import { prisma } from "../../../lib/prisma";
import { CreateTutorProfileInput } from "./tutors.type";


export const TutorService = {
  createTutorProfile: async (userId: string, data: CreateTutorProfileInput) => {
    return prisma.tutorProfile.create({
      data: {
        userId,
        title: data.title,
        headline: data.headline,
        description: data.description,
        hourlyRate: data.hourlyRate,
        experience: data.experience ?? 0,
        education: data.education,
        categories: data.categories
          ? {
              connect: data.categories.map(id => ({ id })),
            }
          : undefined,
      },
      include: {
        user: true,
        categories: true,
      },
    });
  },

  getAllTutors: async (filters: {
    isAvailable?: boolean;
    categoryId?: string;
  }) => {
    return prisma.tutorProfile.findMany({
      where: {
        isAvailable: filters.isAvailable,
        categories: filters.categoryId
          ? { some: { id: filters.categoryId } }
          : undefined,
      },
      include: {
        user: true,
        categories: true,
      },
      orderBy: {
        averageRating: "desc",
      },
    });
  },

  getTutorById: async (id: string) => {
    return prisma.tutorProfile.findUnique({
      where: { id },
      include: {
        user: true,
        categories: true,
        reviews: true,
      },
    });
  },

  updateTutorProfile: async (
    tutorId: string,
    userId: string,
    data: Partial<CreateTutorProfileInput>
  ) => {
    const updateData = {
      ...data,
      categories: data.categories
        ? {
            connect: data.categories.map(id => ({ id })),
          }
        : undefined,
    };
    return prisma.tutorProfile.update({
      where: {
        id: tutorId,
        userId, // 🔐 ownership check
      },
      data: updateData,
    });
  },

  deleteTutorProfile: async (tutorId: string, userId: string) => {
    return prisma.tutorProfile.delete({
      where: {
        id: tutorId,
        userId,
      },
    });
  },
};
