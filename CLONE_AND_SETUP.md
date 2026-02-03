# How to Clone and Setup Frontend Separately

This guide shows you how to extract the frontend from the current repository and set it up as a **completely separate project**.

## Option 1: Using Git Subtree (Recommended)

If you have the frontend in a branch or separate path:

```bash
# Create a new directory for frontend
mkdir skill-bridge-frontend
cd skill-bridge-frontend

# Initialize git
git init

# Add backend repo as remote
git remote add -f backend <backend-repo-url>

# Extract frontend files only (if they're in a branch)
git pull backend frontend-branch --allow-unrelated-histories
```

## Option 2: Manual Copy (Easiest)

### Step 1: Create New Next.js Project

```bash
# Create a fresh Next.js project
npx create-next-app@latest skill-bridge-frontend \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --no-git \
  --import-alias '@/*'

cd skill-bridge-frontend
```

### Step 2: Install Additional Dependencies

```bash
npm install \
  @tanstack/react-query@^5.51.0 \
  @tanstack/react-form@^0.11.0 \
  @tanstack/zod-form-adapter@^0.11.0 \
  @reduxjs/toolkit@^1.9.7 \
  react-redux@^8.1.3 \
  better-auth@^1.4.17 \
  zod@^3.22.4 \
  sonner@^1.3.1
```

### Step 3: Copy Frontend Files

From the backend repo (where frontend files are currently stored), copy these directories:

```
From current repo:          To new repo:
app/                   →    app/
components/            →    components/
lib/                   →    lib/
types/                 →    types/
providers.tsx          →    providers.tsx
```

Also copy configuration files:
```
next.config.mjs        →    next.config.mjs
tailwind.config.ts     →    tailwind.config.ts
tsconfig.json          →    tsconfig.json
postcss.config.js      →    postcss.config.js
.env.example           →    .env.example
.gitignore             →    .gitignore
```

### Step 4: Create Environment File

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3001
NODE_ENV=development
```

### Step 5: Install Dependencies

```bash
npm install
```

### Step 6: Verify Setup

```bash
# Check TypeScript compiles
npx tsc --noEmit

# Start dev server
npm run dev
```

Access http://localhost:3000

## Option 3: Create as Separate Git Repository

### Step 1: Create GitHub Repository

1. Go to github.com
2. Create new repository `skill-bridge-frontend`
3. Leave it empty (don't add README yet)

### Step 2: Clone Backend & Extract Frontend

```bash
# Clone backend repo (if not already done)
git clone <backend-repo-url>
cd skill-bridge-backend

# Create new folder for frontend content
mkdir ../skill-bridge-frontend
cd ../skill-bridge-frontend

# Initialize as git repo
git init
git remote add origin https://github.com/yourusername/skill-bridge-frontend.git
```

### Step 3: Copy All Frontend Files

```bash
# Copy from backend repo
cp -r ../skill-bridge-backend/app .
cp -r ../skill-bridge-backend/components .
cp -r ../skill-bridge-backend/lib .
cp -r ../skill-bridge-backend/types .
cp ../skill-bridge-backend/providers.tsx .
cp ../skill-bridge-backend/next.config.mjs .
cp ../skill-bridge-backend/tailwind.config.ts .
cp ../skill-bridge-backend/tsconfig.json .
cp ../skill-bridge-backend/postcss.config.js .
cp ../skill-bridge-backend/.env.example .
```

### Step 4: Create New package.json

```bash
npm init -y
```

Update package.json with:

```json
{
  "name": "skill-bridge-frontend",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "next": "^16.0.0",
    "@tanstack/react-query": "^5.51.0",
    "@tanstack/react-form": "^0.11.0",
    "@tanstack/zod-form-adapter": "^0.11.0",
    "@reduxjs/toolkit": "^1.9.7",
    "react-redux": "^8.1.3",
    "better-auth": "^1.4.17",
    "zod": "^3.22.4",
    "tailwindcss": "^3.4.1",
    "sonner": "^1.3.1"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "@types/node": "^20.10.6",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.4.1"
  }
}
```

### Step 5: Create .env.local

```bash
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3001
NODE_ENV=development
EOF
```

### Step 6: Install & Verify

```bash
npm install
npm run dev
```

### Step 7: Push to GitHub

```bash
echo "# Skill Bridge Frontend

A modern Next.js frontend for the Skill Bridge tutoring platform.

## Setup

\`\`\`bash
npm install
cp .env.example .env.local
# Update .env.local with your backend URL
npm run dev
\`\`\`

Visit http://localhost:3000" > README.md

git add .
git commit -m "Initial commit: Frontend setup"
git branch -M main
git push -u origin main
```

## Option 4: Download as ZIP

If you just want the files without git:

### From v0 Interface

1. Click the three dots (⋮) in the top-right
2. Select "Download ZIP"
3. Extract the ZIP file

The downloaded folder already contains all frontend files and configurations.

## File Structure Check

After setup, your project should look like:

```
skill-bridge-frontend/
├── app/
│   ├── auth/
│   ├── dashboard/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── ...
├── components/
│   ├── auth/
│   ├── bookings/
│   ├── layout/
│   ├── tutors/
│   └── ui/
├── lib/
│   ├── api/
│   ├── auth/
│   ├── hooks/
│   ├── redux/
│   └── validations/
├── types/
│   └── api.ts
├── providers.tsx
├── package.json
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── .env.local
└── README.md
```

## Verify Installation

```bash
# Check all files exist
ls -la app/
ls -la components/
ls -la lib/
ls -la types/

# Check TypeScript
npx tsc --noEmit

# Check build
npm run build

# Start dev server
npm run dev
```

## Setup Backend

While frontend is running, set up the backend in a separate terminal:

```bash
# Terminal 2
cd ../skill-bridge-backend
npm install
npm run prisma:migrate
npm run dev
```

Backend should run on :3001

## Test Connection

1. Open http://localhost:3000
2. You should see the landing page
3. Click "Sign Up"
4. Try to create an account
5. If successful, backend is connected

If you get connection errors:
- Verify backend is running on :3001
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Check browser console for errors

## Common Issues

### Error: Cannot find module '@/...'

Check `tsconfig.json` has path alias:
```json
"paths": {
  "@/*": ["./*"]
}
```

### Error: Port 3000 already in use

```bash
# Use different port
npm run dev -- -p 3001
```

### Error: Module not found

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Error: Cookies not being sent

Check:
1. Backend is running
2. `.env.local` has correct `NEXT_PUBLIC_API_URL`
3. Backend CORS allows credentials
4. Using HTTPS in production

## Next Steps

1. **Verify frontend works locally** - Visit http://localhost:3000
2. **Set up backend** - Follow backend SETUP_GUIDE.md
3. **Test auth flow** - Sign up and explore dashboard
4. **Deploy** - Use Vercel for frontend, Railway/Heroku for backend

## Documentation

- `README.md` - Project overview
- `SETUP_GUIDE.md` - Detailed setup with backend
- `DEPLOYMENT.md` - Production deployment
- `FRONTEND_ONLY.md` - Frontend-specific guide
- `FRONTEND_FILES_REFERENCE.md` - All files explained

## Support

If you get stuck:
1. Check troubleshooting section in SETUP_GUIDE.md
2. Verify all environment variables
3. Check both frontend and backend are running
4. Review console errors in browser DevTools

---

**You're ready to go!** Choose an option above and start developing.
