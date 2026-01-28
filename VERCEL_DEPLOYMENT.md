# 🚀 Deploy Vista CAREs Application to Vercel

Complete guide to deploy your Vista CAREs Grant Funding Application System to Vercel.

## ✅ Prerequisites

1. **GitHub Account** - https://github.com
2. **Vercel Account** - https://vercel.com (sign up with GitHub)
3. **Git installed** on your computer

## 📋 Step-by-Step Deployment

### Step 1: Initialize Git Repository

```bash
cd /Users/danielschacht/Vista CAREs-website

# Initialize Git
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: Vista CAREs Application System"
```

### Step 2: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `Vista CAREs-website` (or your choice)
3. Description: "Vista CAREs Grant Funding Application System"
4. Choose **Private** (recommended) or Public
5. **Do NOT** initialize with README, .gitignore, or license
6. Click "Create repository"

### Step 3: Push to GitHub

```bash
# Add GitHub as remote (replace YOUR-USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR-USERNAME/Vista CAREs-website.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 4: Deploy to Vercel

#### Option A: Via Vercel Website (Easiest)

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Click "Import" next to your `Vista CAREs-website` repository
4. Vercel will auto-detect the configuration ✨
5. Click "Deploy"
6. Wait 2-3 minutes for deployment
7. Done! Your app is live! 🎉

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
cd /Users/danielschacht/Vista CAREs-website
vercel

# Follow the prompts:
# - Link to existing project? No
# - Project name: Vista CAREs-website
# - Directory: ./
# - Override settings? No

# Deploy to production
vercel --prod
```

### Step 5: Access Your Application

After deployment, Vercel will give you URLs like:
- **Production:** `https://erf3-website.vercel.app`
- **Preview:** `https://erf3-website-git-main-username.vercel.app`

## 🔧 Configuration

All configuration is in `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build"
    },
    {
      "src": "backend/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/backend/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/$1"
    }
  ]
}
```

## 📊 How It Works

### Frontend (React)
- Built as static files
- Served from Vercel's global CDN
- Super fast loading

### Backend (Express API)
- Runs as Vercel Serverless Functions
- Auto-scales based on demand
- API endpoints: `https://your-app.vercel.app/api/*`

### Data Storage
- JSON files persist between deployments
- Stored in `/tmp` directory on Vercel
- **Note:** Data resets on new deployments!

## ⚠️ Important: Data Persistence

**Current Setup:** JSON files in Vercel's `/tmp` directory are temporary!

### For Production, Choose One:

#### Option 1: Vercel Postgres (Recommended)
```bash
# Add Vercel Postgres to your project
vercel env add DATABASE_URL
```

#### Option 2: External Database
- **MongoDB Atlas** (free tier)
- **Supabase** (PostgreSQL, free tier)
- **PlanetScale** (MySQL, free tier)

#### Option 3: Vercel KV (Key-Value Store)
Good for simple data storage

### Quick Fix: Download Data Before Redeployment

```bash
# Download current applications
curl https://your-app.vercel.app/api/applications > backup.json

# After deployment, re-upload if needed
```

## 🔄 Continuous Deployment

Every time you push to GitHub, Vercel automatically:
1. Detects the push
2. Builds your application
3. Runs tests (if configured)
4. Deploys to preview URL
5. After review, promotes to production

### Update Your App

```bash
# Make changes to your code
git add .
git commit -m "Add new feature"
git push

# Vercel automatically deploys! 🚀
```

## 🌍 Environment Variables

If you need environment variables:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add variables:
   - `NODE_ENV` = `production` (auto-set)
   - `DATABASE_URL` = `your-database-url` (if using DB)

## 🐛 Troubleshooting

### Build Fails

**Check build logs in Vercel dashboard:**
- Frontend issues: Check `frontend/package.json` scripts
- Backend issues: Check `backend/server.js` exports

### API Not Working

1. Check that API routes start with `/api`
2. Verify CORS settings in `backend/server.js`
3. Check Vercel Functions logs

### Data Not Persisting

Remember: `/tmp` storage is temporary in serverless.
- Use a database for production
- Or accept that data resets on deployment

## 📱 Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain (e.g., `erf3.yourdomain.com`)
3. Follow DNS configuration instructions
4. SSL certificate auto-generated ✨

## 💰 Cost

Vercel Free Tier includes:
- ✅ 100 GB bandwidth/month
- ✅ 100 GB-hours serverless execution
- ✅ Unlimited deployments
- ✅ Automatic HTTPS
- ✅ Global CDN

**This is more than enough for most applications!**

## 🎯 Best Practices

1. **Test Locally First**
   ```bash
   ./start.sh  # Test before pushing
   ```

2. **Use Preview Deployments**
   - Every branch gets a preview URL
   - Test before merging to main

3. **Monitor Usage**
   - Check Vercel dashboard for analytics
   - Monitor function execution times

4. **Backup Data**
   - Export applications regularly
   - Use CSV export feature in dashboard

## 🚀 Advanced: Vercel CLI Commands

```bash
# View deployment logs
vercel logs

# List all deployments
vercel ls

# Remove a deployment
vercel rm deployment-url

# Open project in browser
vercel open

# Check project info
vercel inspect
```

## 🎉 You're Live!

Your Vista CAREs Application is now:
- ✅ Deployed globally
- ✅ Automatically backed up
- ✅ Continuously deployed on git push
- ✅ HTTPS secured
- ✅ Super fast with CDN

**Share your URL with your team!**

## 📚 Resources

- Vercel Docs: https://vercel.com/docs
- React Deployment: https://vercel.com/guides/deploying-react-with-vercel
- Node.js on Vercel: https://vercel.com/docs/functions/serverless-functions
- GitHub Integration: https://vercel.com/docs/git/vercel-for-github

---

Need help? Check Vercel's documentation or the main README.md file.
