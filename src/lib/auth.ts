import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL, // backend URL

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  trustedOrigins: [
    process.env.APP_URL!, // frontend URL
    "https://skill-bridge-fronted-production.up.railway.app", // Add explicitly
  ],

  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },

  // FIX: Remove crossSubDomainCookies since your frontend and backend are on different domains
  // crossSubDomainCookies is for subdomains like api.example.com and app.example.com
  // You're using vercel.app and railway.app which are different domains
  
  advanced: {
    // Use custom cookie settings instead
    useSecureCookies: true, // Force secure cookies
     generateSessionToken: () => {
      return crypto.randomUUID(); // Ensure session tokens are generated
    },
    cookieOptions: {
      sameSite: "none", // ✅ Required for cross-domain
      secure: true,      // ✅ Required for sameSite: none
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
  },

  user: {
    additionalFields: {
      phone: { type: "string", required: false },
      role: { type: "string", required: true },
      status: { type: "string", required: false },
    },
  },

  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: false,
  },
});