import express from "express";
import cors from "cors";
// REMOVE: import session from "express-session";
import { toNodeHandler } from "better-auth/node";
import { auth } from "../lib/auth";
import { TutorRoutes } from "./modules/tutors/tutors.routes";

const app = express();
// Helper function to normalize URLs (remove trailing slashes)
const normalizeOrigin = (origin: string) => {
  return origin?.replace(/\/$/, ''); // Remove trailing slash
};
const allowedOrigins = [
  process.env.APP_URL || "http://localhost:3000",
  process.env.PROD_APP_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      // Normalize the origin by removing trailing slash
      const normalizedOrigin = normalizeOrigin(origin);

      // Check if normalized origin is allowed
      const isAllowed =
        allowedOrigins.includes(normalizedOrigin) ||
        /^https:\/\/.*\.railway\.app$/.test(normalizedOrigin) ||
        /^https:\/\/.*\.vercel\.app$/.test(normalizedOrigin);

      if (isAllowed) {
        callback(null, true);
      } else {
        console.error(`CORS blocked origin: ${origin}`); // For debugging
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
  }),
);

// REMOVE the session middleware - Better Auth handles it

app.use(express.json());
// Auth routes
app.use("/api/auth", toNodeHandler(auth));
// turor routes
app.use('/api/tutors', TutorRoutes);

// root route
app.get('/', (req, res) => {
  res.send('Welcome to the Skill Bridge Backend API');
});



export default app;