import express from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "../lib/auth";
import cors from "cors"
import { notFound } from "../lib/middleware/notFound";
import errorHandler from "../lib/middleware/globalErrorHandler";
import { TutorRoutes } from "./modules/tutors/tutors.routes";
import { BookingRoutes } from "./modules/booking/booking.routes";
import { CategoryRoutes } from "./modules/tutor-category/tutor-category.routes";
import { UserRoutes } from "./modules/user/user.routes";
import { DashboardRoutes } from "./modules/dashboard/dashboard.routes";
const app = express();

app.use(cors({
    origin: process.env.APP_URL || "http://localhost:3000",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
}));

app.use(express.json());

// Auth routes 
app.all('/api/auth/*splat', toNodeHandler(auth));
// User routes
app.use("/api/users", UserRoutes);
// Booking routes
app.use("/api/bookings", BookingRoutes);
// Tutor category routes
 app.use("/api/tutor-categories", CategoryRoutes);
// Tutors routes
app.use("/api/tutors", TutorRoutes);
// Dashboard routes
app.use("/api/dashboard", DashboardRoutes);
// Not found handler
app.use(notFound);

// Error handler
app.use(errorHandler);

app.get("/", (req, res) => {
    res.send("Welcome to Skill Bridge")
})

export default app