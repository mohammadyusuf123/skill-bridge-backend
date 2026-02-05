import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
  baseURL: 'https://skill-bridge-backend-production-27ac.up.railway.app',
  
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  secret: process.env.BETTER_AUTH_SECRET!,

  trustedOrigins: [
    "https://skill-bridge-fronted-production.up.railway.app",
    "http://localhost:3000",
  ],

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },

  // ✅ USE THIS COOKIE CONFIGURATION - It should override defaults
  cookie: {
    name: {
      sessionToken: "__Secure-better-auth.session_token",
      callbackUrl: "__Secure-better-auth.callback-url",
      csrfToken: "__Host-better-auth.csrf-token",
      state: "__Secure-better-auth.state",
      nonce: "__Secure-better-auth.nonce",
      pkceCodeVerifier: "__Secure-better-auth.pkce.code_verifier"
    },
    sameSite: "none", // Force none
    secure: true,
    httpOnly: true,
    domain: ".railway.app", // Set domain
    path: "/",
  },

  advanced: {
    useSecureCookies: true,
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