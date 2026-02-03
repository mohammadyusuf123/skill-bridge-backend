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
import { SeasonRoutes } from "./modules/user/season.route";

const app = express();
// Configure CORS to allow both production and Vercel preview deployments
const allowedOrigins = [
  process.env.APP_URL || "http://localhost:3000",
  process.env.PROD_APP_URL, // Production frontend URL
].filter(Boolean); // Remove undefined values

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      // Check if origin is in allowedOrigins or matches Vercel preview pattern
      const isAllowed =
        allowedOrigins.includes(origin) ||
        /^https:\/\/next-blog-client.*\.vercel\.app$/.test(origin) ||
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
interface CookieOptions {
  secure: boolean;
  httpOnly: boolean;
  sameSite: string;
  domain: string;
  maxAge: number;
  proxy?: boolean; // Add the 'proxy' property here
}

app.use(session({
  secret: process.env.BETTER_AUTH_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    httpOnly: true,
    sameSite: 'none',
    domain: '.vercel.app',
    maxAge: 24 * 60 * 60 * 1000,
    proxy: true, // Use the 'proxy' property here
  } as CookieOptions
}));

app.use(express.json());

// Auth routes (now CORS is already applied)
app.all('/api/auth/*splat', toNodeHandler(auth));

// Routes
app.all('/api/auth/*splat', toNodeHandler(auth));
app.use("/api/users", UserRoutes);
app.use("/api/bookings", BookingRoutes);
app.use("/api/tutor-categories", CategoryRoutes);
app.use("/api/tutors", TutorRoutes);
app.use("/api/dashboard", DashboardRoutes);
app.use("/api/availability", AvailabilityRoutes);
app.use("/api/reviews", ReviewRoutes);
app.use("/api/season", SeasonRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("Welcome to Skill Bridge");
});

// Not found handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

export default app;
function session(arg0: {
  secret: string; resave: boolean; saveUninitialized: boolean; cookie: {
    secure: boolean; // HTTPS only
    httpOnly: boolean; // Prevent XSS
    sameSite: string; // Allow cross-site cookies
    domain: string; // Or remove domain entirely
    maxAge: number;
  };
}): any {
  throw new Error("Function not implemented.");
}

