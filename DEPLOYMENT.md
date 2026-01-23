# Vercel Deployment Guide

This guide will help you deploy both the frontend and backend to Vercel.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. A PostgreSQL database (you can use Vercel Postgres, Supabase, or any PostgreSQL provider)
3. Environment variables configured

## Step 1: Prepare Your Database

1. Set up a PostgreSQL database
2. Get your database connection string (DATABASE_URL)
3. Run migrations:
   ```bash
   cd backend
   npx prisma migrate deploy
   ```

## Step 2: Configure Environment Variables

In your Vercel project settings, add the following environment variables:

### Required Environment Variables:

- `DATABASE_URL` - Your PostgreSQL connection string
  - Example: `postgresql://user:password@host:5432/database?sslmode=require`
  
- `JWT_SECRET` - Secret key for JWT token signing
  - Generate a secure random string (at least 32 characters)
  - Example: `openssl rand -base64 32`

- `E2B_API_KEY` - Your E2B API key (if using E2B sandboxes)
  - Get it from https://e2b.dev

- `MISTRAL_API_KEY` - Your Mistral AI API key (if using Mistral)
  - Get it from https://console.mistral.ai

### Optional Environment Variables:

- `VITE_API_URL` - Frontend API base URL (leave empty for same-domain deployment)
  - For production on Vercel, you can leave this empty to use relative paths
  - For development: `http://localhost:5000`

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Follow the prompts:
   - Link to existing project or create new
   - Set root directory: `.` (current directory)
   - Override settings: No (use vercel.json)

### Option B: Deploy via GitHub/GitLab

1. Push your code to GitHub/GitLab
2. Go to https://vercel.com/new
3. Import your repository
4. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `.` (root)
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/dist`
   - **Install Command**: `cd backend && npm install`
5. Add all environment variables in the project settings
6. Deploy!

## Step 4: Post-Deployment

1. After deployment, your app will be available at `https://your-project.vercel.app`
2. API routes will be available at `https://your-project.vercel.app/api/*`
3. Test the deployment:
   - Visit the frontend URL
   - Try logging in
   - Test API endpoints

## Project Structure

```
.
├── backend/          # Express API server
│   ├── api/         # Vercel serverless function entry point
│   ├── routes/      # API routes
│   └── prisma/      # Database schema and migrations
├── frontend/        # React + Vite app
│   └── dist/        # Build output (generated)
└── vercel.json      # Vercel configuration
```

## Troubleshooting

### Build Fails

1. Check that all dependencies are in package.json
2. Ensure Node.js version is compatible (Vercel uses Node 20.x)
3. Check build logs in Vercel dashboard

### API Routes Not Working

1. Verify `backend/api/index.ts` exports the Express app correctly
2. Check that routes are prefixed with `/api` in vercel.json
3. Ensure environment variables are set correctly

### Database Connection Issues

1. Verify DATABASE_URL is correct
2. Check database allows connections from Vercel IPs
3. Ensure SSL is enabled if required
4. Run `npx prisma generate` in build command if needed

### Frontend Can't Connect to API

1. Check that `VITE_API_URL` is set correctly or left empty for relative paths
2. Verify CORS is configured in backend
3. Check browser console for errors

## Additional Notes

- The backend runs as serverless functions on Vercel
- Each API route is a separate serverless function
- Cold starts may occur on first request
- Database connections should use connection pooling for serverless
- Consider using Prisma Accelerate for better serverless performance

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Review environment variables
3. Test API endpoints directly
4. Check database connectivity

