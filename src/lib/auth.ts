import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";


export const auth = betterAuth({
  baseURL: "https://skill-bridge-backend-sooty.vercel.app/api/auth",

  trustedOrigins: [
    "https://skill-bridge-fronted.vercel.app",
  ],

  advanced: {
    useSecureCookies: true,
    crossSubDomainCookies: {
      enabled: false, // VERY IMPORTANT
    },
  },

    cookies: {
      session: {
        sameSite: "none",   // 🔥 REQUIRED for cross-site
        secure: true,       // 🔥 REQUIRED for SameSite=None
        path: "/",          // 🔥 REQUIRED
      },
    },

  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: false,
  },
});
