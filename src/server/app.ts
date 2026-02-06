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
// Update your cookie interceptor middleware in app.ts
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
        
        // Check if SameSite is already None
        if (cookie.includes('SameSite=None')) {
          console.log('Already has SameSite=None, adding Domain if missing');
          // Just ensure Domain is set
          if (!cookie.includes('Domain=')) {
            return cookie + '; Domain=.railway.app';
          }
          return cookie;
        }
        
        // Remove any existing SameSite and ensure proper Domain
        let modified = cookie
          .replace(/; SameSite=(Lax|Strict|None)/gi, '') // Remove any SameSite
          .replace(/; Domain=[^;]+/gi, ''); // Remove existing Domain
        
        // Add REQUIRED attributes for cross-domain
        // CRITICAL: SameSite=None MUST be set for cross-domain
        // CRITICAL: Secure MUST be true when SameSite=None
        // Try both domain formats
        modified = modified + '; SameSite=None; Secure; Domain=.railway.app';
        
        // Clean up
        modified = modified.replace(/;;/g, ';');
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