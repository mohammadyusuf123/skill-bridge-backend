import { Router } from "express";
import { TutorCategoryController } from "./tutor-category.controller";

const router = Router();

// Add category to tutor
router.post("/", TutorCategoryController.add);

// Get all categories for a tutor
router.get("/tutor/:tutorId", TutorCategoryController.getByTutor);

// Set primary category
router.patch(
  "/tutor/:tutorId/category/:categoryId/primary",
  TutorCategoryController.setPrimary
);

// Remove category from tutor
router.delete(
  "/tutor/:tutorId/category/:categoryId",
  TutorCategoryController.remove
);

export const TutorCategoryRoutes = router;
