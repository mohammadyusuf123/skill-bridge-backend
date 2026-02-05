import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "../lib/auth";
import { TutorRoutes } from "./modules/tutors/tutors.routes";

const app = express();

// ✅ Get the backend URL from environment
const BACKEND_URL = process.env.BETTER_AUTH_URL || 
                    "skill-bridge-backend-production-27ac.up.railway.app";

const FRONTEND_URL = process.env.APP_URL || 
                     "https://skill-bridge-fronted-production.up.railway.app";

// ✅ CORS Configuration for different subdomains
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        FRONTEND_URL,
        "http://localhost:3000",
        "https://skill-bridge-fronted-production.up.railway.app"
      ];
      
      // Allow requests with no origin or from allowed origins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log('Blocked by CORS:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Set-Cookie"],
    maxAge: 86400, // 24 hours
  })
);

app.use(express.json());

// ✅ Debug middleware - Log all requests
app.use((req, res, next) => {
  console.log('=== REQUEST ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Origin:', req.headers.origin);
  console.log('Cookies:', req.headers.cookie);
  console.log('Host:', req.headers.host);
  next();
});

// ✅ Add headers middleware for cross-domain cookies
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && [
    "https://skill-bridge-fronted-production.up.railway.app",
    "http://localhost:3000"
  ].includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// Auth routes
app.use("/api/auth", toNodeHandler(auth));

// ✅ Create a test endpoint to check cookies
app.get('/api/test-cookies', (req, res) => {
  res.json({
    success: true,
    cookies: req.headers.cookie || 'No cookies sent',
    headers: {
      origin: req.headers.origin,
      host: req.headers.host,
      'user-agent': req.headers['user-agent']
    }
  });
});

// ✅ Create an endpoint to set a test cookie
app.get('/api/set-test-cookie', (req, res) => {
  res.cookie('test_cookie', 'backend_cookie_value', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    domain: '.railway.app', // Critical for subdomain sharing
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  });
  
  res.json({ success: true, message: 'Test cookie set' });
});

// Tutor routes
app.use('/api/tutors', TutorRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Skill Bridge Backend API');
});

export default app;