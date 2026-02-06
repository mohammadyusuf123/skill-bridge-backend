import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  secret: process.env.BETTER_AUTH_SECRET!,

  // 1. CRITICAL: Explicitly define ALL cookie names
  cookie: {
    name: {
      sessionToken: "__Secure-better-auth.session_token",
      callbackUrl: "__Secure-better-auth.callback-url",
      csrfToken: "__Host-better-auth.csrf-token",
      state: "__Secure-better-auth.state",
      nonce: "__Secure-better-auth.nonce",
      pkceCodeVerifier: "__Secure-better-auth.pkce.code_verifier"
    },
    // 2. CRITICAL: Set cross-site attributes
    sameSite: "none" as const, // Force 'none' for cross-domain
    secure: true,              // Required when sameSite is 'none'
    httpOnly: true,
    path: "/",
  },

  // 3. Ensure advanced settings align
  advanced: {
    useSecureCookies: true,
  },

  // ... rest of your configuration (trustedOrigins, session, user, emailAndPassword)
  trustedOrigins: [
    process.env.APP_URL!,
    "http://localhost:3000",
  ],
  session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
  user: { additionalFields: { /* your fields */ } },
  emailAndPassword: { enabled: true },
});