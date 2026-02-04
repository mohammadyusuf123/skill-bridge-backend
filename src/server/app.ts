import express from "express";
import cors from "cors";
// REMOVE: import session from "express-session";
import { toNodeHandler } from "better-auth/node";
import { auth } from "../lib/auth";
import { TutorRoutes } from "./modules/tutors/tutors.routes";

const app = express();
// CORS
app.use(
  cors({
    origin: [
      "https://skill-bridge-fronted-production.up.railway.app",
      "http://localhost:3000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
  }),
);

app.use(express.json());

// Auth routes
app.use("/api/auth", toNodeHandler(auth));

// ✅ MIDDLEWARE: Force SameSite=None on all Set-Cookie headers
app.use((req, res, next) => {
  const originalSetHeader = res.setHeader.bind(res);
  
  res.setHeader = function (name: string, value: any) {
    if (name.toLowerCase() === 'set-cookie') {
      const cookies = Array.isArray(value) ? value : [value];
      const modifiedCookies = cookies.map((cookie: string) => {
        // Replace SameSite=Lax or SameSite=Strict with SameSite=None
        return cookie
          .replace(/SameSite=Lax/gi, 'SameSite=None')
          .replace(/SameSite=Strict/gi, 'SameSite=None')
          // Ensure Secure flag is present
          .replace(/;(?!\s*Secure)/g, '; Secure');
      });
      return originalSetHeader('Set-Cookie', modifiedCookies);
    }
    return originalSetHeader(name, value);
  };
  
  next();
});
// turor routes
app.use('/api/tutors', TutorRoutes);

// root route
app.get('/', (req, res) => {
  res.send('Welcome to the Skill Bridge Backend API');
});



export default app;