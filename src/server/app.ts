import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "../lib/auth";
import { TutorRoutes } from "./modules/tutors/tutors.routes";

const app = express();

// ✅ CORS Configuration - Simplified but effective
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "https://skill-bridge-fronted-production.up.railway.app",
        "http://localhost:3000",
      ];
      
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Set-Cookie"],
  })
);

app.use(express.json());

// ✅ REMOVE the custom middleware that modifies Set-Cookie headers
// BetterAuth handles cookies internally, your middleware conflicts with it

// Auth routes - Should be registered before any cookie middleware
app.use("/api/auth", toNodeHandler(auth));

// ✅ Optional: Add a middleware to debug headers (remove in production)
app.use((req, res, next) => {
  // Log incoming requests for debugging
  console.log(`${req.method} ${req.url}`);
  console.log('Origin:', req.headers.origin);
  console.log('Cookies:', req.headers.cookie);
  next();
});

// Tutor routes
app.use('/api/tutors', TutorRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Skill Bridge Backend API');
});

// ✅ Add a debug endpoint to check cookies
app.get('/api/debug/cookies', (req, res) => {
  res.json({
    cookies: req.headers.cookie,
    headers: req.headers,
  });
});

export default app;