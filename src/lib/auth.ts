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
  ],
 session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  advanced: {
    cookiePrefix: "better-auth",
    useSecureCookies: process.env.NODE_ENV === "production",
    crossSubDomainCookies: {
      enabled: false,
    },
    disableCSRFCheck: true, // Allow requests without Origin header (Postman, mobile apps, etc.)
  },

  // advanced: {
  //   cookies: {
  //     sessionToken: {
  //       name: "better-auth.session",
  //       attributes: {
  //         httpOnly: true,
  //         secure: true,          // ✅ REQUIRED on Vercel
  //          sameSite: "lax", // ✅ Same-origin, so "lax" works
  //       path: "/",
  //       },
  //     },
  //   },
  // },
//  session: {
//     cookieCache: {
//       enabled: true,
//       maxAge: 5 * 60, // 5 minutes
//     },
//   },
  // advanced: {
  //   cookies: {
  //      cookie: {
  //   name: "better-auth.session_token",
  //   httpOnly: true,
  //   secure: process.env.NODE_ENV === "production",
  //   sameSite: "none",
  //   domain: process.env.NODE_ENV === "production" ? ".vercel.app" : "localhost",
  //   path: "/",
  //   maxAge: 60 * 60 * 24 * 7, // 7 days
  // },
  //   }
    
    
  
  // },

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
