# Deployment Guide - Smart Expense Tracker

## Production Deployment on Vercel

This guide explains how to deploy the Smart Expense Tracker to Vercel.

### Prerequisites

- **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
- **GitHub Repository**: Push code to GitHub
- **MongoDB Atlas**: Active cluster with connection string
- **Environment Variables**: Set up in Vercel dashboard

---

## Step 1: Prepare Your Code

### 1.1 Check All Files Are Ready

```bash
# Verify build works locally
npm run build

# Verify API endpoints work
npm run test:mongodb
```

### 1.2 Update `.env` Variables

The code uses `VITE_MONGODB_URI` for both frontend and API routes.

**Local Development:**
- `.env.local` contains your MongoDB connection string

**Production (Vercel):**
- Will be set in Vercel Environment Variables

### 1.3 Verify Project Structure

```
smart-expense-tracker/
├── api/
│   └── expenses.ts           # Serverless API function
├── components/               # React components
├── src/
│   ├── App.tsx
│   ├── index.tsx
│   └── ...
├── public/
├── vite.config.ts
├── vercel.json               # ✅ Vercel configuration
├── tsconfig.json
├── package.json
└── .gitignore               # ✅ Must exclude .env.local
```

---

## Step 2: Push to GitHub

```bash
# Initialize git if needed
git init
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

**Important:** Ensure `.env.local` is in `.gitignore` ✅

---

## Step 3: Deploy to Vercel

### 3.1 Connect Repository

1. Go to [vercel.com/new](https://vercel.com/new)
2. Select **Import Git Repository**
3. Choose your GitHub repository
4. Click **Import**

### 3.2 Configure Project

**Project Name:** `smart-expense-tracker` (or your preference)

**Framework:** Vite (auto-detected)

**Root Directory:** `./` (default)

### 3.3 Set Environment Variables

Before deploying, add environment variables:

1. Click **Environment Variables**
2. Add variable:
   ```
   Name: VITE_MONGODB_URI
   Value: mongodb+srv://your_username:your_password@cluster.mongodb.net/smart-expense-tracker?retryWrites=true&w=majority
   ```
3. Click **Add**

### 3.4 Deploy

Click **Deploy** button and wait for deployment to complete.

**Expected URL:** `https://smart-expense-tracker-XXX.vercel.app`

---

## Step 4: Verify Deployment

### 4.1 Check Frontend

```
https://your-project.vercel.app
```

Should load the expense tracker app.

### 4.2 Check API Endpoint

```bash
curl https://your-project.vercel.app/api/expenses
```

Should return JSON array of expenses.

### 4.3 Test Features

1. Open app in browser
2. Add an expense
3. Verify it appears in the list
4. Check MongoDB Atlas - should have the data
5. Delete expense - should be removed

---

## Step 5: Monitoring & Logs

### View Deployment Logs

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Click **Deployments** tab
4. Click latest deployment
5. View **Function logs** for API errors

### Monitor MongoDB

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Check **Logs** for connection issues
3. Verify **expense-tracker** database exists
4. Check **expenses** collection for data

---

## Troubleshooting

### API Not Working

**Error:** `Cannot find module 'mongodb'`
- **Solution:** Ensure `mongodb` is in dependencies (not devDependencies)

**Error:** `Invalid scheme, expected connection string...`
- **Solution:** Verify MongoDB URI is set in Vercel environment variables

### Data Not Saving

**Issue:** Expenses added but not in MongoDB
- **Solution:** 
  1. Check API logs in Vercel dashboard
  2. Verify MongoDB connection string
  3. Check database permissions in MongoDB Atlas
  4. Ensure IP whitelist includes Vercel IPs (or use 0.0.0.0/0)

### CORS Errors

**Error:** `Access to fetch blocked by CORS policy`
- **Solution:** CORS headers are configured in `vercel.json` - should work automatically

### Build Fails

```bash
# Check build locally
npm run build

# Check for TypeScript errors
npm test

# Check dependencies
npm list
```

---

## Environment Variables Reference

| Variable | Value | Required |
|----------|-------|----------|
| `VITE_MONGODB_URI` | MongoDB connection string | ✅ Yes |

### Example MongoDB Connection String
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/smart-expense-tracker?retryWrites=true&w=majority
```

---

## Database Configuration

### MongoDB Atlas Setup

1. **Create Cluster:**
   - Go to [cloud.mongodb.com](https://cloud.mongodb.com)
   - Create M0 (free) cluster
   - Choose region close to Vercel deployment

2. **Create Database User:**
   - Username: `beauham4t_db_user` (or your choice)
   - Password: Generate secure password
   - Save both

3. **Network Access:**
   - Allow IP: `0.0.0.0/0` (for Vercel)
   - Or: Add Vercel's IP ranges

4. **Connection String:**
   - Copy from **Connect** button
   - Replace `<password>` with actual password
   - Database: `smart-expense-tracker`

---

## Performance Optimization

### Frontend

- ✅ Vite build automatically optimizes
- ✅ React 19 with latest optimizations
- ✅ Charts (Recharts) lazy loaded

### Backend

- ✅ MongoDB connection pooling (cached)
- ✅ Serverless functions (auto-scale)
- ✅ API response caching ready

### Recommendations

```bash
# Monitor bundle size
npm run build

# Check for unused imports
npm test
```

---

## Rollback

If deployment has issues:

1. Go to **Deployments** tab
2. Find previous working deployment
3. Click **⋮ (three dots)**
4. Click **Promote to Production**

---

## CI/CD Pipeline

Vercel automatically:
- ✅ Deploys on every push to `main`
- ✅ Creates preview deployments for PRs
- ✅ Runs build verification
- ✅ Handles SSL/TLS certificates

### Preview Deployments

Every pull request gets a unique preview URL for testing.

---

## Security Checklist

- ✅ `.env.local` in `.gitignore`
- ✅ MongoDB credentials in Vercel env vars (not in code)
- ✅ CORS headers configured
- ✅ API validates requests
- ✅ No sensitive data in git history

---

## Scaling & Limits

**Vercel Free Tier:**
- 100 serverless function invocations/day
- 1GB/month bandwidth
- Unlimited deployments

**MongoDB Atlas Free Tier:**
- 512MB storage
- 500 reads/sec
- Sufficient for small projects

**Upgrade when:**
- Need more API calls → Vercel Pro
- Need more data → MongoDB upgrade tier

---

## Support

**Vercel Issues:**
- Check [vercel.com/docs](https://vercel.com/docs)
- Contact: support@vercel.com

**MongoDB Issues:**
- Check [docs.mongodb.com](https://docs.mongodb.com)
- Community: [MongoDB Forums](https://www.mongodb.com/community/forums)

**Application Issues:**
- Check logs: `vercel.com/dashboard → Deployments → Logs`
- Check MongoDB Atlas: `cloud.mongodb.com → Database → Collections`

---

## Next Steps

After successful deployment:

1. ✅ Test all features in production
2. ✅ Monitor logs and errors
3. ✅ Set up alerts in MongoDB Atlas
4. ✅ Share URL with users
5. ✅ Collect feedback

Happy deploying! 🚀
