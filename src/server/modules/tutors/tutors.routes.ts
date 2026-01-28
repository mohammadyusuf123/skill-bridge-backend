import { Router } from "express";
import { TutorController } from "./tutors.controller";


const router = Router();

router.post("/create-tutor",
      TutorController.create);
router.get("/", TutorController.getAll);
router.get("/:id", TutorController.getById);
router.patch("/:id", TutorController.update);
router.delete("/:id", TutorController.remove);

export const TutorRoutes = router;
