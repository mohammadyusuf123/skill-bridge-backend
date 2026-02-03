# Skill Bridge Frontend - Deployment Guide

## Pre-Deployment Checklist

- [ ] Backend API is deployed and accessible
- [ ] Environment variables are configured
- [ ] Better Auth cookies are properly configured
- [ ] CORS settings on backend allow frontend origin
- [ ] All dependencies are installed and tested locally

## Vercel Deployment (Recommended)

### Step 1: Connect Repository

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Select your repository
4. Click "Import"

### Step 2: Configure Environment Variables

In Vercel dashboard, go to Settings > Environment Variables and add:

```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_BETTER_AUTH_URL=https://api.yourdomain.com
```

### Step 3: Deploy

Click "Deploy". Vercel will automatically build and deploy on every push to main branch.

## Docker Deployment

### Build Image

```bash
docker build -t skill-bridge-frontend:latest .
```

### Run Container

```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://api.yourdomain.com \
  -e NEXT_PUBLIC_BETTER_AUTH_URL=https://api.yourdomain.com \
  skill-bridge-frontend:latest
```

## Self-Hosted Deployment

### 1. Build Production Bundle

```bash
npm install
npm run build
```

### 2. Transfer Files

Transfer `package.json`, `package-lock.json`, `.next`, and `public/` folders to server.

### 3. Install Production Dependencies

```bash
npm ci --only=production
```

### 4. Set Environment Variables

```bash
export NEXT_PUBLIC_API_URL=https://api.yourdomain.com
export NEXT_PUBLIC_BETTER_AUTH_URL=https://api.yourdomain.com
```

### 5. Start Server

```bash
npm start
```

## Cookie Configuration for Better Auth

### Backend Requirements

Ensure backend has these cookie settings in `src/lib/auth.ts`:

```typescript
advanced: {
  useSecureCookies: process.env.NODE_ENV === "production",
  cookiePrefix: "better-auth",
  crossSubDomainCookies: {
    enabled: false,
  },
  disableCSRFCheck: false, // Important for production
}
```

### CORS Configuration

Backend must allow credentials:

```typescript
app.use(cors({
  origin: process.env.APP_URL,
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
}))
```

### Domain Configuration

If frontend and backend are on different domains:

1. Use absolute URLs (not relative)
2. Ensure both domains have proper SSL certificates
3. Set `SameSite=None` and `Secure` flags on cookies (backend)
4. Add backend domain to trusted origins (backend)

## Performance Optimization

### Image Optimization

The app is configured to serve images from any remote source. Images are optimized by Next.js.

### Code Splitting

Next.js automatically code-splits:
- Per page
- Per component
- Per route

### Caching Strategy

- Static: Landing page, error pages
- ISR (Incremental Static Regeneration): Categories (30 minutes)
- Dynamic: Auth-protected pages
- Client-side: TanStack Query caching (5 minutes)

### Database Queries

Server-side renders use direct database queries when possible to avoid extra API calls.

## Monitoring

### Error Tracking

Set up error tracking service (Sentry recommended):

```typescript
// Add to next.config.mjs
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### Performance Monitoring

Use Vercel Analytics or similar to monitor:
- Core Web Vitals
- API response times
- Error rates

## Troubleshooting Deployment

### Issue: Cookies Not Working After Deployment

**Solution:**
- Verify `HTTPS` is enabled (cookies require secure context)
- Check CORS credentials configuration
- Ensure cookie domain is correctly set
- Verify backend and frontend URLs match exactly

### Issue: Session Lost on Page Reload

**Solution:**
- Check `AuthProvider` is mounted at app root
- Verify `useSession()` hook is properly initialized
- Check Redux store is persisting state
- Ensure API client includes credentials in all requests

### Issue: "X-Frame-Options" Header Error

**Solution:**
This is not applicable here as we're not using frames. Ignore if from third-party services.

### Issue: CORS Error on API Calls

**Solution:**
1. Add frontend URL to backend CORS origins
2. Ensure `credentials: true` in API client
3. Backend must send `Access-Control-Allow-Credentials: true`

## Rollback Procedure

### Vercel

1. Go to Deployments tab
2. Find previous successful deployment
3. Click "..." and select "Promote to Production"

### Docker

1. Stop current container: `docker stop <container-id>`
2. Run previous image: `docker run -d <previous-image-id>`

### Manual Deployment

1. Backup `.next` folder
2. Restore from git: `git checkout <previous-commit>`
3. Run `npm run build` and `npm start`

## Scaling Considerations

### Database

- Ensure backend database can handle concurrent connections
- Implement connection pooling
- Monitor database query performance

### API Rate Limiting

- Frontend should respect backend rate limits
- Implement client-side request debouncing (already in place with React Query)
- Use Redis for rate limiting on backend

### CDN Configuration

- Serve static assets through CDN
- Cache static images and fonts
- Set appropriate cache headers

## Security Checklist

- [ ] HTTPS enabled on all domains
- [ ] CORS properly configured
- [ ] API keys not exposed in frontend code
- [ ] Sensitive data not stored in localStorage
- [ ] Better Auth cookies are HTTP-only
- [ ] Input validation on all forms (Zod schemas)
- [ ] SQL injection prevention (backend responsibility)
- [ ] XSS protection (Next.js handles most)

## Post-Deployment Verification

1. Test user authentication flow
2. Verify bookings can be created
3. Check tutor profiles load correctly
4. Test file uploads if applicable
5. Monitor error logs for issues
6. Verify email notifications if implemented
7. Test on multiple devices and browsers

## Maintenance

### Regular Updates

```bash
npm update
npm audit fix
```

### Database Migrations

Backend migrations should be run before deploying frontend changes that depend on schema updates.

### Feature Flags

Consider implementing feature flags for gradual rollouts using services like LaunchDarkly or Vercel Feature Flags.
