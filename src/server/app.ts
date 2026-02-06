import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "../lib/auth";
import { TutorRoutes } from "./modules/tutors/tutors.routes";

const app = express();

// ✅ Get URLs from environment
const BACKEND_URL = process.env.BETTER_AUTH_URL || 
                    "https://skill-bridge-backend-production-27ac.up.railway.app";

const FRONTEND_URL = process.env.APP_URL || 
                     "https://skill-bridge-fronted-production.up.railway.app";

// ✅ Create CORS middleware configuration
const corsOptions = {
  origin: function (origin: string | undefined, callback: Function) {
    // Normalize the origin - remove trailing slashes
    const normalizeOrigin = (url: string | undefined) => {
      if (!url) return url;
      return url.replace(/\/$/, ''); // Remove trailing slash
    };
    
    const normalizedOrigin = normalizeOrigin(origin);
    const allowedOrigins = [
      FRONTEND_URL.replace(/\/$/, ''),
      "http://localhost:3000",
      "https://skill-bridge-fronted-production.up.railway.app"
    ].map(url => url.replace(/\/$/, '')); // Normalize all allowed origins
    
    console.log('CORS Check:', {
      receivedOrigin: origin,
      normalizedOrigin,
      allowedOrigins
    });
    
    // Allow requests with no origin (like mobile apps or curl)
    if (!normalizedOrigin) {
      console.log('Allowing: No origin provided');
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(normalizedOrigin)) {
      console.log('Allowing origin:', normalizedOrigin);
      callback(null, true);
    } else {
      console.log('Blocking origin:', normalizedOrigin);
      console.log('Allowed origins:', allowedOrigins);
      callback(new Error(`Not allowed by CORS. Origin: ${normalizedOrigin}`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type", 
    "Authorization", 
    "X-Requested-With",
    "Cookie",
    "Accept"
  ],
  exposedHeaders: ["Set-Cookie"],
  maxAge: 86400, // 24 hours
};

// ✅ Apply CORS middleware
app.use(cors(corsOptions));

// ✅ Handle preflight requests for ALL routes
app.options('/api/:path*', (req, res) => {
  const origin = req.headers.origin;
  
  if (origin && [
    "https://skill-bridge-fronted-production.up.railway.app",
    "http://localhost:3000"
  ].includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
  res.header('Access-Control-Max-Age', '86400');
  res.status(204).end();
});

app.use(express.json());

// ✅ Add headers middleware to ensure CORS headers are set for all responses
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Set CORS headers for all responses
  if (origin && [
    "https://skill-bridge-fronted-production.up.railway.app",
    "http://localhost:3000"
  ].some(allowed => origin.replace(/\/$/, '').includes(allowed.replace(/\/$/, '')))) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie');
  res.header('Access-Control-Expose-Headers', 'Set-Cookie');
  
  next();
});

// ✅ Debug middleware
app.use((req, res, next) => {
  console.log('=== REQUEST ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Origin:', req.headers.origin);
  console.log('Cookies:', req.headers.cookie);
  console.log('Host:', req.headers.host);
  console.log('User-Agent:', req.headers['user-agent']);
  next();
});

// ✅ Cookie interceptor middleware (keep your existing one)
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
        
        // 1. Remove existing SameSite AND Secure flags
        let modified = cookie
          .replace(/; SameSite=Lax/gi, '')
          .replace(/; SameSite=Strict/gi, '')
          .replace(/; SameSite=None/gi, '')
          .replace(/; Secure/gi, ''); // Remove existing Secure
        
        // 2. Remove existing Domain if present
        modified = modified.replace(/; Domain=[^;]+/gi, '');
        
        // 3. Add correct settings (ONCE)
        modified = modified + '; SameSite=None; Secure; Domain=.railway.app';
        
        // 4. Clean up duplicate semicolons
        modified = modified.replace(/;;/g, ';').replace(/; $/, '');
        
        console.log('Modified cookie:', modified);
        return modified;
      });
      
      return originalSetHeader.call(this, 'Set-Cookie', modifiedCookies);
    }
    
    return originalSetHeader.call(this, name, value);
  };
  
  next();
});

// ✅ Create CORS test endpoint
app.get('/api/cors-test', (req, res) => {
  res.json({
    success: true,
    message: 'CORS test successful',
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

// ✅ Set test cookie endpoint with CORS headers
app.get('/api/set-test-cookie', (req, res) => {
  res.cookie('test_cookie', 'backend_cookie_value', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    domain: '.railway.app',
    maxAge: 24 * 60 * 60 * 1000
  });
  
  res.json({ 
    success: true, 
    message: 'Test cookie set',
    origin: req.headers.origin
  });
});

// ✅ Check cookies endpoint
app.get('/api/check-cookies', (req, res) => {
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

// Auth routes
app.use("/api/auth", toNodeHandler(auth));

// Tutor routes
app.use('/api/tutors', TutorRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Skill Bridge Backend API');
});

export default app;