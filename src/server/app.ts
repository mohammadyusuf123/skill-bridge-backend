import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "../lib/auth";

// Middleware
import { notFound } from "../lib/middleware/notFound";
import errorHandler from "../lib/middleware/globalErrorHandler";

// Routes
import { TutorRoutes } from "./modules/tutors/tutors.routes";
import { BookingRoutes } from "./modules/booking/booking.routes";
import { CategoryRoutes } from "./modules/tutor-category/tutor-category.routes";
import { UserRoutes } from "./modules/user/user.routes";
import { DashboardRoutes } from "./modules/dashboard/dashboard.routes";
import { AvailabilityRoutes } from "./modules/availability/availability.routes";
import { ReviewRoutes } from "./modules/reviews/reviews.routes";

const app = express();
const allowedOrigins = [
  process.env.APP_URL || "http://localhost:3000",
  
].filter(Boolean); // Remove undefined values

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      // Check if origin is in allowedOrigins or matches Vercel preview pattern
      const isAllowed =
        allowedOrigins.includes(origin) ||
        /^https:\/\/skill-bridge-fronted.*\.vercel\.app$/.test(origin) ||
        /^https:\/\/.*\.vercel\.app$/.test(origin); // Any Vercel deployment

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
  }),
);


app.use(express.json());



// Routes
app.all('/api/auth/*splat', toNodeHandler(auth));
app.use("/api/users", UserRoutes);
app.use("/api/bookings", BookingRoutes);
app.use("/api/tutor-categories", CategoryRoutes);
app.use("/api/tutors", TutorRoutes);
app.use("/api/dashboard", DashboardRoutes);
app.use("/api/availability", AvailabilityRoutes);
app.use("/api/reviews", ReviewRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("Welcome to Skill Bridge");
});

// Not found handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

export default app;
