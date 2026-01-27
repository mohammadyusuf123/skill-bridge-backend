import express from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "../lib/auth";
import cors from "cors"
import { notFound } from "../lib/middleware/notFound";
import errorHandler from "../lib/middleware/globalErrorHandler";
import { TutorRoutes } from "./modules/tutors/tutors.routes";
import { TutorCategoryRoutes } from "./modules/tutor-category/tutor-category.routes";
const app = express();

app.use(cors({
    origin: "http://localhost:3000",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
}));

app.use(express.json());

// Auth routes 
app.all('/api/auth/*splat', toNodeHandler(auth));
// Tutor category routes
 app.use("/api/tutor-categories", TutorCategoryRoutes);
// Tutors routes
app.use("/api/tutors", TutorRoutes);

// Not found handler
app.use(notFound);

// Error handler
app.use(errorHandler);

app.get("/", (req, res) => {
    res.send("Welcome to Skill Bridge")
})

export default app