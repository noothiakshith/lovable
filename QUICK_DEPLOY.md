# Quick Deploy to Vercel

## 🚀 Fast Deployment Steps

### 1. Install Vercel CLI (if not installed)
```bash
npm i -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Set Environment Variables
Before deploying, make sure you have these ready:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Random secret for JWT (generate with: `openssl rand -base64 32`)
- `E2B_API_KEY` - Your E2B API key (optional, if using E2B)
- `MISTRAL_API_KEY` - Your Mistral AI key (optional, if using Mistral)

### 4. Deploy
```bash
vercel
```

When prompted:
- **Set up and deploy?** → Yes
- **Which scope?** → Your account
- **Link to existing project?** → No (or Yes if updating)
- **What's your project's name?** → Your project name
- **In which directory is your code located?** → `./` (current directory)
- **Override settings?** → No

### 5. Add Environment Variables in Vercel Dashboard
1. Go to your project on Vercel
2. Settings → Environment Variables
3. Add all required variables
4. Redeploy if needed

### 6. Run Database Migrations
After first deployment, run migrations:
```bash
cd backend
npx prisma migrate deploy
```

Or use Vercel's CLI:
```bash
vercel env pull .env.local
cd backend
npx prisma migrate deploy
```

## 📝 Important Notes

- **API Routes**: All API calls should go to `/api/*`
- **Frontend**: Served from root `/`
- **Backend**: Serverless functions at `/api/*`
- **Database**: Make sure your database allows connections from Vercel

## 🔍 Verify Deployment

1. Visit your Vercel URL: `https://your-project.vercel.app`
2. Test login/signup
3. Check API: `https://your-project.vercel.app/api/auth/login`

## 🐛 Troubleshooting

- **Build fails**: Check Node version (should be 20.x)
- **API 404**: Verify `vercel.json` routing
- **DB connection**: Check `DATABASE_URL` and database firewall
- **CORS errors**: Backend has CORS enabled, should work

## 📚 Full Documentation

See `DEPLOYMENT.md` for detailed instructions.

