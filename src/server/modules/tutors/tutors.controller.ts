import { Request, Response } from "express";
import { TutorService } from "./tutors.services";


export const TutorController = {
  create: async (req: Request, res: Response) => {
    console.log(req.user);
    const userId = req.user!.id;

    const tutor = await TutorService.createTutorProfile(userId, req.body);

    res.status(201).json({
      success: true,
      data: tutor,
    });
  },

  getAll: async (req: Request, res: Response) => {
    const tutors = await TutorService.getAllTutors({
      isAvailable: req.query.isAvailable
        ? req.query.isAvailable === "true"
        : undefined,
      categoryId: req.query.categoryId as string | undefined,
    });

    res.json({
      success: true,
      data: tutors,
    });
  },

  getById: async (req: Request, res: Response) => {
    const tutor = await TutorService.getTutorById(req.params.id as string);

    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    res.json({ success: true, data: tutor });
  },

  update: async (req: Request, res: Response) => {
    const tutor = await TutorService.updateTutorProfile(
      req.params.id as string,
      req.user!.id,
      req.body
    );

    res.json({ success: true, data: tutor });
  },

  remove: async (req: Request, res: Response) => {
    await TutorService.deleteTutorProfile(req.params.id as string, req.user!.id);

    res.status(204).send();
  },
};
