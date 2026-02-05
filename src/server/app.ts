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

// ✅ Choose ONLY ONE of these cookie middleware options:

// OPTION 1: Simple Set-Cookie interceptor (RECOMMENDED)
app.use((req, res, next) => {
  const originalSetHeader = res.setHeader;
  
  res.setHeader = function (name: string, value: string | number | string[]): any {
    if (name.toLowerCase() === 'set-cookie') {
      console.log('=== SET-COOKIE INTERCEPT ===');
      
      // Convert to array of strings
      const cookies: string[] = [];
      
      if (typeof value === 'string') {
        cookies.push(value);
      } else if (Array.isArray(value)) {
        value.forEach((v: string | number) => {
          if (typeof v === 'string') {
            cookies.push(v);
          } else if (typeof v === 'number') {
            cookies.push(v.toString());
          }
        });
      } else if (typeof value === 'number') {
        cookies.push(value.toString());
      }
      
      // Modify each cookie
      const modifiedCookies = cookies.map(cookie => {
        console.log('Original cookie:', cookie);
        
        // 1. Remove existing SameSite
        let modified = cookie
          .replace(/; SameSite=Lax/gi, '')
          .replace(/; SameSite=Strict/gi, '')
          .replace(/; SameSite=None/gi, '');
        
        // 2. Remove existing Domain if present
        modified = modified.replace(/; Domain=[^;]+/gi, '');
        
        // 3. Add correct settings
        modified = modified + '; SameSite=None; Secure; Domain=.railway.app';
        
        // 4. Clean up duplicate semicolons
        modified = modified.replace(/;;/g, ';');
        
        console.log('Modified cookie:', modified);
        return modified;
      });
      
      return originalSetHeader.call(this, 'Set-Cookie', modifiedCookies);
    }
    
    return originalSetHeader.call(this, name, value);
  };
  
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

// ✅ Create a test endpoint for the middleware
app.get('/api/test-middleware', (req, res) => {
  // Test setting cookies that will be intercepted
  res.setHeader('Set-Cookie', [
    'test1=value1; HttpOnly; Secure; SameSite=Lax',
    'test2=value2; HttpOnly; SameSite=Strict',
    'test3=value3; Secure'
  ]);
  
  res.json({ 
    message: 'Check response headers for modified cookies',
    requestCookies: req.headers.cookie || 'none'
  });
});

// Tutor routes
app.use('/api/tutors', TutorRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Skill Bridge Backend API');
});

export default app;