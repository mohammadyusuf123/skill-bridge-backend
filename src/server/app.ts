import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "../lib/auth";
import { TutorRoutes } from "./modules/tutors/tutors.routes";

const app = express();

// ✅ Configuration
const FRONTEND_URL = process.env.APP_URL || 
                     "https://skill-bridge-fronted-production.up.railway.app";

const allowedOrigins = [
  FRONTEND_URL.replace(/\/$/, ''),
  "http://localhost:3000",
  "https://skill-bridge-fronted-production.up.railway.app"
].map(url => url.replace(/\/$/, ''));

// ✅ SIMPLE CORS configuration - remove complex function
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie", "Accept"],
  exposedHeaders: ["Set-Cookie"],
  maxAge: 86400,
}));

app.use(express.json());

// ✅ Debug middleware
app.use((req, res, next) => {
  console.log('=== REQUEST ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Origin:', req.headers.origin);
  console.log('Cookies:', req.headers.cookie);
  console.log('Host:', req.headers.host);
  next();
});

// ✅ Cookie interceptor middleware - SIMPLIFIED
app.use((req, res, next) => {
  const originalSetHeader = res.setHeader;
  
  res.setHeader = function (name: string, value: any): any {
    if (name.toLowerCase() === 'set-cookie') {
      console.log('=== SET-COOKIE INTERCEPT ===');
      
      let cookies: string[] = [];
      
      // Convert to string array
      if (typeof value === 'string') {
        cookies = [value];
      } else if (Array.isArray(value)) {
        cookies = value.map(v => String(v));
      } else {
        cookies = [String(value)];
      }
      
      const modifiedCookies = cookies.map(cookie => {
        console.log('Original:', cookie);
        
        // REMOVE ALL existing SameSite, Secure, and Domain flags
        let modified = cookie
          .replace(/; SameSite=(Lax|Strict|None)/gi, '')
          .replace(/; Secure/gi, '') // Remove Secure
          .replace(/; Domain=[^;]+/gi, ''); // Remove Domain
        
        // Add the CORRECT flags (only once each)
        modified = modified + '; SameSite=None; Secure; Domain=.railway.app';
        
        // Clean up any duplicate semicolons
        modified = modified.replace(/;;/g, ';');
        
        // Remove trailing semicolon if present
        if (modified.endsWith(';')) {
          modified = modified.slice(0, -1);
        }
        
        console.log('Modified:', modified);
        return modified;
      });
      
      return originalSetHeader.call(this, 'Set-Cookie', modifiedCookies);
    }
    
    return originalSetHeader.call(this, name, value);
  };
  
  next();
});

// ✅ Test endpoints (place before auth routes for easy testing)
app.get('/api/cors-test', (req, res) => {
  res.json({
    success: true,
    message: 'CORS working',
    origin: req.headers.origin,
    cookies: req.headers.cookie || 'none'
  });
});

app.get('/api/set-test-cookie', (req, res) => {
  res.cookie('test_cookie', 'value_' + Date.now(), {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    domain: '.railway.app',
    maxAge: 3600000
  });
  
  res.json({ 
    success: true, 
    message: 'Test cookie set',
    origin: req.headers.origin
  });
});

// ✅ IMPORTANT: NO app.options('*', ...) line!
// Express has issues with '*' in options. Handle preflight manually if needed:

// Manual OPTIONS handler for specific routes
const handleOptions = (req: express.Request, res: express.Response) => {
  const origin = req.headers.origin;
  
  if (origin && allowedOrigins.includes(origin.replace(/\/$/, ''))) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
  res.header('Access-Control-Max-Age', '86400');
  res.status(204).end();
};

// Apply to specific routes that need OPTIONS
// app.options('/api/auth/:path*', handleOptions);
// app.options('/api/tutors/:path*', handleOptions);
app.options('/api/cors-test', handleOptions);
app.options('/api/set-test-cookie', handleOptions);
// Add to app.ts before auth routes
app.get('/api/cookie-debug', (req, res) => {
  console.log('=== COOKIE DEBUG ENDPOINT ===');
  console.log('Request cookies:', req.headers.cookie);
  console.log('Request origin:', req.headers.origin);
  console.log('Request host:', req.headers.host);
  
  // Set multiple test cookies with different configurations
  const now = Date.now();
  
  // Cookie 1: Manual set-cookie header
  res.setHeader('Set-Cookie', [
    `debug_cookie_manual=${now}_1; HttpOnly; Secure; SameSite=None; Domain=.railway.app; Path=/; Max-Age=3600`
  ]);
  
  // Cookie 2: Using res.cookie()
  res.cookie('debug_cookie_res', `${now}_2`, {
    httpOnly: true,
    secure: true,
    sameSite: 'none' as const,
    domain: '.railway.app',
    maxAge: 3600000
  });
  
  // Cookie 3: What Better-Auth normally sets (will be intercepted)
  res.cookie('debug_cookie_auth', `${now}_3`, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax' as const,
    maxAge: 3600000
  });
  
  res.json({
    success: true,
    requestInfo: {
      cookies: req.headers.cookie || 'none',
      origin: req.headers.origin,
      host: req.headers.host,
      userAgent: req.headers['user-agent']
    },
    message: 'Three test cookies set. Check response headers.'
  });
});

app.get('/api/cookie-check', (req, res) => {
  res.json({
    success: true,
    cookiesReceived: req.headers.cookie || 'none',
    cookieCount: req.headers.cookie ? req.headers.cookie.split(';').length : 0
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

// 404 handler
// app.use('*', (req, res) => {
//   res.status(404).json({
//     success: false,
//     error: `Route ${req.originalUrl} not found`
//   });
// });

export default app;