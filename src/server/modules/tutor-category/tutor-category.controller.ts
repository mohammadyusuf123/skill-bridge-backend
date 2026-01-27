import { Request, Response } from "express";
import { TutorCategoryService } from "./tutor-category.services";

export const TutorCategoryController = {
  add: async (req: Request, res: Response) => {
    const tutorCategory = await TutorCategoryService.addCategoryToTutor(
      req.body
    );

    res.status(201).json({
      success: true,
      data: tutorCategory,
    });
  },

  getByTutor: async (req: Request, res: Response) => {
    const categories = await TutorCategoryService.getTutorCategories(
      req.params.tutorId as string
    );

    res.json({
      success: true,
      data: categories,
    });
  },

  setPrimary: async (req: Request, res: Response) => {
    const { tutorId, categoryId } = req.params;

    const result = await TutorCategoryService.setPrimaryCategory(
      tutorId as string,
      categoryId as string
    );

    res.json({
      success: true,
      data: result,
    });
  },

  remove: async (req: Request, res: Response) => {
    const { tutorId, categoryId } = req.params;

    await TutorCategoryService.removeCategoryFromTutor(tutorId as string, categoryId as string);

    res.status(204).send();
  },
};
