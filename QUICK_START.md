# Quick Start Checklist

Complete this checklist to get your frontend running in 5 minutes.

## Prerequisites ✓
- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Git installed (if using git)
- [ ] Backend running on http://localhost:3001 (optional for now)

---

## Option A: Quick Setup (5 minutes)

### 1. Create Project (1 minute)
```bash
npx create-next-app@latest skill-bridge-frontend \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --no-git \
  --import-alias '@/*'

cd skill-bridge-frontend
```
- [ ] Command completed successfully

### 2. Install Dependencies (2 minutes)
```bash
npm install @tanstack/react-query@^5.51.0 \
  @tanstack/react-form@^0.11.0 \
  @tanstack/zod-form-adapter@^0.11.0 \
  @reduxjs/toolkit@^1.9.7 \
  react-redux@^8.1.3 \
  better-auth@^1.4.17 \
  zod@^3.22.4 \
  sonner@^1.3.1
```
- [ ] All dependencies installed

### 3. Copy Files (1 minute)
From the current repo, copy:
- [ ] `app/` folder
- [ ] `components/` folder
- [ ] `lib/` folder
- [ ] `types/` folder
- [ ] `providers.tsx`
- [ ] `next.config.mjs`
- [ ] `tailwind.config.ts`
- [ ] `tsconfig.json`
- [ ] `postcss.config.js`
- [ ] `.env.example`

### 4. Setup Environment (1 minute)
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3001
NODE_ENV=development
```
- [ ] `.env.local` created and edited

### 5. Start! (< 1 minute)
```bash
npm run dev
```
- [ ] Dev server running on http://localhost:3000
- [ ] Open browser and see landing page

---

## Option B: Download Pre-Made

If using the v0 downloaded version:

### 1. Extract ZIP
```bash
unzip skill-bridge-frontend.zip
cd skill-bridge-frontend
```
- [ ] Extracted successfully

### 2. Install Dependencies
```bash
npm install
```
- [ ] All packages installed

### 3. Create Environment File
```bash
cp .env.example .env.local
```
- [ ] `.env.local` created

### 4. Start Development
```bash
npm run dev
```
- [ ] Dev server running
- [ ] Browser shows http://localhost:3000

---

## Verify Installation

Once running, check these items:

### Frontend Page
- [ ] http://localhost:3000 loads
- [ ] Landing page displays
- [ ] "Sign Up" button visible
- [ ] "Sign In" button visible

### Navigation
- [ ] Click "Sign Up" → See registration form
- [ ] Form shows name, email, password fields
- [ ] Form has "Student" and "Tutor" role options

### Console
- [ ] No red errors in browser console
- [ ] No TypeScript compilation errors in terminal

---

## Next Steps

### To Test with Backend
1. Start backend on :3001
   ```bash
   cd ../skill-bridge-backend
   npm run dev
   ```

2. In frontend, try to sign up
   ```
   http://localhost:3000 → Sign Up → Fill form → Click Sign Up
   ```

3. Should create account and redirect to dashboard

- [ ] Backend running on :3001
- [ ] Frontend connects successfully
- [ ] Sign up creates account

### To Deploy
See `DEPLOYMENT.md` for:
- [ ] Vercel deployment
- [ ] Docker container
- [ ] Self-hosted setup

### To Understand Code
1. Read `README.md` (5 min)
2. Read `FRONTEND_ONLY.md` (15 min)
3. Reference `FRONTEND_FILES_REFERENCE.md` while coding

---

## Troubleshooting

### "Port 3000 already in use"
```bash
npm run dev -- -p 3001
```
Or kill the process using port 3000

### "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

### "TypeScript errors"
```bash
npx tsc --noEmit
```

### "Cannot connect to backend"
1. Verify backend is running: `http://localhost:3001`
2. Check `.env.local` has correct URL
3. Check browser Network tab for errors

### "Cookies not being set"
1. Backend and frontend must be on same origin in production
2. In development, CORS must allow credentials
3. Check backend `CORS_ORIGIN` includes `http://localhost:3000`

---

## File Structure Quick Check

Your project should have:
```
skill-bridge-frontend/
├── app/                    ✓
│   ├── auth/
│   ├── dashboard/
│   ├── layout.tsx
│   └── page.tsx
├── components/             ✓
│   ├── auth/
│   ├── bookings/
│   ├── layout/
│   ├── tutors/
│   └── ui/
├── lib/                    ✓
│   ├── api/
│   ├── auth/
│   ├── hooks/
│   ├── redux/
│   └── validations/
├── types/                  ✓
│   └── api.ts
├── providers.tsx           ✓
├── package.json            ✓
├── next.config.mjs         ✓
├── tailwind.config.ts      ✓
├── tsconfig.json           ✓
├── .env.local              ✓
└── node_modules/
```

Check off each item:
- [ ] app/ folder
- [ ] components/ folder
- [ ] lib/ folder
- [ ] types/ folder
- [ ] providers.tsx
- [ ] package.json
- [ ] Configuration files
- [ ] .env.local file

---

## Important Files to Know

| File | Purpose | Status |
|------|---------|--------|
| `app/layout.tsx` | Root layout with providers | ✓ |
| `app/page.tsx` | Landing page | ✓ |
| `lib/api/client.ts` | API client | ✓ |
| `lib/auth/auth-provider.tsx` | Auth management | ✓ |
| `lib/redux/store.ts` | State management | ✓ |
| `providers.tsx` | Root providers wrapper | ✓ |

---

## Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm start               # Start prod server

# Debugging
npx tsc --noEmit        # Check TypeScript
npm run lint            # Run ESLint

# Cleanup
rm -rf .next            # Clear Next.js cache
rm -rf node_modules     # Clear dependencies
npm install             # Reinstall
```

---

## API Endpoints to Know

Your app connects to these backend endpoints:

```
Authentication:
  POST   /auth/sign-up
  POST   /auth/sign-in
  POST   /auth/sign-out

Users:
  GET    /api/users/profile
  PUT    /api/users/profile

Tutors:
  GET    /api/tutors
  GET    /api/tutors/search
  POST   /api/tutors/profile
  PUT    /api/tutors/profile

Bookings:
  POST   /api/bookings
  GET    /api/bookings/my-bookings
  PUT    /api/bookings/:id
  POST   /api/bookings/:id/cancel
```

(Only reachable if backend running on :3001)

---

## What Each Tech Does

| Tech | Role | In Your App |
|------|------|-----------|
| **Next.js** | Framework | Routes, server rendering |
| **React** | UI Library | Components, state |
| **TypeScript** | Type Safety | `.ts` and `.tsx` files |
| **Tailwind CSS** | Styling | `className` styling |
| **Redux** | State Management | Global UI state |
| **TanStack Query** | Data Fetching | API calls, caching |
| **Better Auth** | Authentication | Login/signup |
| **Zod** | Validation | Form validation |

---

## Environment Variables Reference

```env
# Required
NEXT_PUBLIC_API_URL=http://localhost:3001

# Also set (can use same URL)
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3001

# Development
NODE_ENV=development
```

All variables starting with `NEXT_PUBLIC_` are exposed to browser.

---

## Deployment Quick Links

### Vercel (Recommended for Next.js)
```bash
npm i -g vercel
vercel
```
Set env vars in Vercel dashboard.

### Docker
See `DEPLOYMENT.md` for Dockerfile

### Self-hosted
See `DEPLOYMENT.md` for setup

---

## Success Checklist

When everything works, you should be able to:

- [ ] See http://localhost:3000 landing page
- [ ] Click "Sign Up" without errors
- [ ] Click "Sign In" without errors
- [ ] No console errors
- [ ] All TypeScript types correct
- [ ] npm run build succeeds
- [ ] Ready to connect backend

---

## Still Stuck?

1. **Read**: `FRONTEND_ONLY.md` (5 min)
2. **Read**: `SETUP_GUIDE.md` → Troubleshooting section
3. **Check**: Browser DevTools → Console and Network tabs
4. **Verify**: `NEXT_PUBLIC_API_URL` in `.env.local`
5. **Try**: Clear cache and restart
   ```bash
   rm -rf .next node_modules package-lock.json
   npm install
   npm run dev
   ```

---

## Documentation Quick Links

- 📖 `README.md` - Project overview
- 🚀 `CLONE_AND_SETUP.md` - How to separate frontend
- 📁 `FRONTEND_ONLY.md` - Frontend guide
- 📚 `FRONTEND_FILES_REFERENCE.md` - All files explained
- 🔧 `SETUP_GUIDE.md` - Full stack setup
- 📡 `DEPLOYMENT.md` - Production deployment
- 📇 `FRONTEND_DOCS_INDEX.md` - Documentation index

---

## Ready?

✅ **All set!** Your frontend is ready to go.

Next:
1. Explore the dashboard at http://localhost:3000
2. Try signing up
3. Connect backend when ready
4. Deploy to production

**Happy coding!** 🚀
