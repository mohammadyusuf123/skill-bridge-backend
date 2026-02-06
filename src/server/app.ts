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
// ===== ADD THIS MIDDLEWARE =====
// Place it after your CORS setup but BEFORE the auth routes
app.use((req, res, next) => {
  // Store the original 'setHeader' function
  const originalSetHeader = res.setHeader;

  // Override the 'setHeader' method to intercept cookies
  res.setHeader = function (name: string, value: string | number | string[]) {
    // Only process 'Set-Cookie' headers
    if (name.toLowerCase() === 'set-cookie') {
      console.log('🔧 INTERCEPTING Set-Cookie Header');
      
      // Convert the value to an array of strings
      const cookies = Array.isArray(value) ? value : [String(value)];
      
      const fixedCookies = cookies.map(cookieStr => {
        console.log('   Original:', cookieStr);
        
        // 1. REPLACE 'SameSite=Lax' or 'SameSite=Strict' with 'SameSite=None'
        // 2. ENSURE 'Secure' is present (required for 'SameSite=None')
        // 3. ADD 'Domain=.railway.app'
        let fixed = cookieStr
          .replace(/; SameSite=(Lax|Strict)/i, '') // Remove old SameSite
          .replace(/; Secure/i, '')                // Remove old Secure to avoid duplicates
          .replace(/; Domain=[^;]+/i, '');         // Remove old Domain
        
        // Append the correct, required attributes
        fixed = fixed + '; SameSite=None; Secure; Domain=.railway.app';
        
        // Clean up any double semicolons
        fixed = fixed.replace(/;;/g, ';');
        
        console.log('   Fixed:   ', fixed);
        return fixed;
      });

      // Call the original function with our modified cookies
      return originalSetHeader.call(this, 'Set-Cookie', fixedCookies);
    }
    
    // For all other headers, use the original function
    return originalSetHeader.call(this, name, value);
  };

  next();
});
// ===== END OF MIDDLEWARE =====
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

app.get('/api/cookie-check', (req, res) => {
  res.json({
    success: true,
    cookiesReceived: req.headers.cookie || 'none',
    cookieCount: req.headers.cookie ? req.headers.cookie.split(';').length : 0
  });
});
// Update your debug endpoint to avoid multiple cookie settings:
app.get('/api/cookie-debug', (req, res) => {
  console.log('=== COOKIE DEBUG ENDPOINT ===');
  console.log('Request cookies:', req.headers.cookie);
  console.log('Request origin:', req.headers.origin);
  console.log('Request host:', req.headers.host);
  
  const now = Date.now();
  
  // Set cookies ONCE using a single method
  const cookiesToSet = [
    `debug_cookie_manual=${now}_1; HttpOnly; Secure; SameSite=None; Domain=.railway.app; Path=/; Max-Age=3600`,
    `debug_cookie_res=${now}_2; HttpOnly; Secure; SameSite=None; Domain=.railway.app; Path=/; Max-Age=3600`,
    `debug_cookie_auth=${now}_3; HttpOnly; Secure; SameSite=None; Domain=.railway.app; Path=/; Max-Age=3600`
  ];
  
  // Set all cookies at once
  res.setHeader('Set-Cookie', cookiesToSet);
  
  res.json({
    success: true,
    requestInfo: {
      cookies: req.headers.cookie || 'none',
      origin: req.headers.origin,
      host: req.headers.host,
      userAgent: req.headers['user-agent']
    },
    message: 'Test cookies set in single header'
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