import { Router } from "express";
import { authMiddleware, UserRole } from "../../../lib/middleware/authMiddleware";
import { TutorController } from "./tutors.controller";


const router = Router();

router.post("/create-tutor",
     authMiddleware(UserRole.STUDENT),
      TutorController.create);
router.get("/", TutorController.getAll);
router.get("/:id", TutorController.getById);
router.patch("/:id",authMiddleware(UserRole.ADMIN), TutorController.update);
router.delete("/:id",authMiddleware(UserRole.ADMIN), TutorController.remove);

export const TutorRoutes = router;
