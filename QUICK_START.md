# 🚀 Vista CAREs Application - Quick Start Guide

## What You Have

✅ **Full-stack web application** with React frontend + Node.js backend
✅ **Multi-tab application form** (5 sections)
✅ **Admin dashboard** with filtering, tracking, and CSV export
✅ **One Git repository** - monorepo structure
✅ **Vercel-ready** - deploy in minutes!
✅ **No SQL database needed** - uses JSON files

## 🏃 Run Locally (Development)

### Quick Start
```bash
cd /Users/danielschacht/Vista CAREs-website
./start.sh
```

Then open: **http://localhost:5173**

### Manual Start (Two Terminals)

**Terminal 1 - Backend:**
```bash
cd /Users/danielschacht/Vista CAREs-website/backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd /Users/danielschacht/Vista CAREs-website/frontend
npm run dev
```

## 🌐 Deploy to Vercel (Production)

### Option 1: GitHub + Vercel Dashboard (Easiest!)

1. **Create GitHub repo:**
   ```bash
   cd /Users/danielschacht/Vista CAREs-website
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Push to GitHub:**
   - Create new repo at github.com
   - Follow GitHub's instructions to push

3. **Deploy on Vercel:**
   - Go to vercel.com/dashboard
   - Click "New Project"
   - Import your GitHub repo
   - Click "Deploy"
   - Done! ✨

### Option 2: Vercel CLI

```bash
npm install -g vercel
cd /Users/danielschacht/Vista CAREs-website
vercel
```

## 📁 Project Structure

```
Vista CAREs-website/                    ← One Git repo
├── frontend/                    ← React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Home.jsx         ← Landing page
│   │   │   ├── ApplicationForm.jsx  ← 5-tab form
│   │   │   └── Dashboard.jsx   ← Admin dashboard
│   │   └── config.js            ← API configuration
│   └── package.json
│
├── backend/                     ← Node.js API
│   ├── server.js                ← Express server
│   └── data/
│       └── applications.json    ← All data stored here
│
├── vercel.json                  ← Vercel configuration
├── README.md                    ← Full documentation
├── VERCEL_DEPLOYMENT.md         ← Deployment guide
└── start.sh                     ← Local startup script
```

## 🎯 Key Features

### Application Form
- 5 tabs matching Excel structure
- Auto-calculates totals
- Customizable step-down plan (6 phases)
- Monthly breakdown (auto-generated)
- Form validation

### Dashboard
- Track all applications
- Filter by: status, demographics, income, amounts, dates
- Search across all fields
- Approve/Deny applications
- Export custom CSV reports
- Real-time statistics

## 💾 Data Storage

**Current:** JSON file storage
- No database setup required
- Perfect for 100-500 applications
- Easy to backup
- Location: `backend/data/applications.json`

**For Scale:** Can easily upgrade to PostgreSQL, MySQL, or MongoDB later

## 🔧 Configuration Files

### vercel.json
- Configures both frontend and backend for Vercel
- Routes `/api/*` to backend
- Routes everything else to frontend

### frontend/src/config.js
- Automatically uses correct API URL
- Local: `http://localhost:3001/api`
- Production: `/api` (relative, works with Vercel)

## 📚 Documentation

- **README.md** - Complete documentation
- **VERCEL_DEPLOYMENT.md** - Step-by-step deployment guide
- **QUICK_START.md** - This file!

## 🆘 Common Issues

### Backend won't start locally
```bash
# Check if port 3001 is in use
lsof -ti:3001

# Kill process if needed
kill $(lsof -ti:3001)
```

### Frontend can't connect to backend
- Ensure backend is running on port 3001
- Check browser console for errors
- Verify config.js is being used

### Vercel deployment fails
- Check vercel.json configuration
- Verify both package.json files exist
- Check Vercel dashboard logs

## 🎉 URLs

**Local Development:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api
- Health Check: http://localhost:3001/api/health

**After Vercel Deployment:**
- App: https://your-app.vercel.app
- API: https://your-app.vercel.app/api
- Health: https://your-app.vercel.app/api/health

## 🔄 Workflow

1. **Develop Locally**
   ```bash
   ./start.sh
   ```

2. **Test Features**
   - Submit test applications
   - Use dashboard filters
   - Export CSV

3. **Commit Changes**
   ```bash
   git add .
   git commit -m "Description of changes"
   git push
   ```

4. **Auto-Deploy**
   - Vercel automatically deploys on push
   - Get preview URL for review
   - Promote to production when ready

## 💡 Pro Tips

1. **Backup Data Regularly**
   ```bash
   cp backend/data/applications.json ~/backups/
   ```

2. **Use Git Branches**
   ```bash
   git checkout -b new-feature
   # Make changes
   git push
   # Vercel creates preview URL for this branch!
   ```

3. **Monitor Vercel Dashboard**
   - Check deployment status
   - View function logs
   - Monitor bandwidth usage

4. **Test Before Deploying**
   - Always test locally first
   - Use preview deployments
   - Review before promoting to production

## 📞 Next Steps

1. ✅ **Test locally** - Run `./start.sh` and test all features
2. ✅ **Create GitHub repo** - Version control your code
3. ✅ **Deploy to Vercel** - Get it online!
4. ✅ **Share with team** - Send them the URL
5. ✅ **Add custom domain** (optional) - Make it yours

## 🎓 Learning Resources

- **Vercel Docs:** https://vercel.com/docs
- **React Docs:** https://react.dev
- **Express Docs:** https://expressjs.com

---

**You're all set! 🚀**

Questions? Check README.md or VERCEL_DEPLOYMENT.md
