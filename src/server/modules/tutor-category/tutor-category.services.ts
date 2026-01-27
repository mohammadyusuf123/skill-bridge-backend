import { prisma } from "../../../lib/prisma";
import { AddTutorCategoryInput } from "./tutor-category.type";


export const TutorCategoryService = {
addCategoryToTutor: async ({ tutorId, categoryId, isPrimary }: AddTutorCategoryInput) => {
  const tutorExists = await prisma.tutorProfile.findUnique({
    where: { id: tutorId },
  });

  if (!tutorExists) {
    throw new Error("Tutor profile not found");
  }

  if (isPrimary) {
    await prisma.tutorCategory.updateMany({
      where: { tutorId },
      data: { isPrimary: false },
    });
  }

  return prisma.tutorCategory.create({
    data: {
      tutorId,
      categoryId,
      isPrimary: isPrimary ?? false,
    },
  });
},


  getTutorCategories: async (tutorId: string) => {
    return prisma.tutorCategory.findMany({
      where: { tutorId },
      include: {
        category: true,
      },
      orderBy: {
        isPrimary: "desc",
      },
    });
  },

  setPrimaryCategory: async (tutorId: string, categoryId: string) => {
    // Reset all
    await prisma.tutorCategory.updateMany({
      where: { tutorId },
      data: { isPrimary: false },
    });

    // Set new primary
    return prisma.tutorCategory.update({
      where: {
        tutorId_categoryId: {
          tutorId,
          categoryId,
        },
      },
      data: {
        isPrimary: true,
      },
    });
  },

  removeCategoryFromTutor: async (tutorId: string, categoryId: string) => {
    return prisma.tutorCategory.delete({
      where: {
        tutorId_categoryId: {
          tutorId,
          categoryId,
        },
      },
    });
  },
};
