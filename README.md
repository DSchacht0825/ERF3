# ERF3 Grant Funding Application System

A full-stack web application for managing ERF3 rental assistance grant applications with a React frontend and Node.js backend.

## Features

### Application Form
- ✅ Multi-tab application form (5 sections)
- ✅ Referring Agency Information
- ✅ Applicant/Client Details
- ✅ Financial Information & Step-Down Plan
- ✅ Automated Monthly Payment Breakdown
- ✅ Landlord Information & Approval
- ✅ Real-time calculations for assistance amounts
- ✅ Form validation

### Admin Dashboard
- ✅ View all applications with status tracking
- ✅ Filter by status, demographics, income, amounts
- ✅ Search across multiple fields
- ✅ Track application status (Pending → Viewed → Approved/Denied)
- ✅ Detailed application view modal
- ✅ Approve/Deny applications
- ✅ Statistics overview
- ✅ Custom report generation
- ✅ Export to CSV with customizable fields

### Data Management
- ✅ JSON-based data storage (simple, no database setup required)
- ✅ RESTful API for all operations
- ✅ Automatic application ID generation
- ✅ Timestamp tracking
- ✅ Status history

## Project Structure

```
ERF3-website/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── Home.jsx
│   │   │   ├── ApplicationForm.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── styles/          # CSS files
│   │   │   ├── Home.css
│   │   │   ├── ApplicationForm.css
│   │   │   └── Dashboard.css
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   └── package.json
│
└── backend/                  # Node.js/Express API
    ├── server.js            # Main server file
    ├── data/                # JSON data storage
    │   └── applications.json
    └── package.json
```

## Technology Stack

**Frontend:**
- React 18
- React Router DOM (navigation)
- Axios (API calls)
- Vite (build tool)
- CSS3

**Backend:**
- Node.js
- Express.js
- CORS
- UUID (unique ID generation)
- JSON file storage

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd /Users/danielschacht/ERF3-website
   ```

2. **Install Backend Dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

You need to run both the backend and frontend servers.

#### Option 1: Two Separate Terminals (Recommended)

**Terminal 1 - Backend Server:**
```bash
cd /Users/danielschacht/ERF3-website/backend
npm start
```
Backend will run on: `http://localhost:3001`

**Terminal 2 - Frontend Server:**
```bash
cd /Users/danielschacht/ERF3-website/frontend
npm run dev
```
Frontend will run on: `http://localhost:5173`

#### Option 2: Background Processes
```bash
# Start backend in background
cd /Users/danielschacht/ERF3-website/backend && npm start &

# Start frontend
cd /Users/danielschacht/ERF3-website/frontend && npm run dev
```

### Accessing the Application

Once both servers are running:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001/api
- **API Health Check:** http://localhost:3001/api/health

## API Endpoints

### Applications
- `GET /api/applications` - Get all applications
- `GET /api/applications/:id` - Get single application
- `POST /api/applications` - Create new application
- `PATCH /api/applications/:id/status` - Update application status
- `PUT /api/applications/:id` - Update entire application
- `DELETE /api/applications/:id` - Delete application

### Statistics
- `GET /api/statistics` - Get dashboard statistics

## Git Repository Structure

### Answer: **ONE Git Repository**

This project uses a **monorepo structure** with both frontend and backend in a single repository:

```
ERF3-website/          # Single Git repository
├── .git/             # Git directory
├── frontend/         # React app
├── backend/          # Node.js API
└── README.md
```

**Advantages:**
- ✅ Easier to manage and deploy
- ✅ Single version history
- ✅ Simpler CI/CD setup
- ✅ Shared documentation

**To initialize Git:**
```bash
cd /Users/danielschacht/ERF3-website
git init
git add .
git commit -m "Initial commit: ERF3 Grant Funding Application System"
```

## Database: JSON vs SQL

### Current Setup: **JSON File Storage (No SQL Required)**

The application currently uses **JSON files** for data storage:

**Advantages:**
- ✅ No database installation required
- ✅ Easy to backup (just copy the file)
- ✅ Simple to understand and debug
- ✅ Perfect for small to medium applications
- ✅ Easy deployment (no database server needed)

**Location:** `/Users/danielschacht/ERF3-website/backend/data/applications.json`

### Future: Upgrading to SQL (Optional)

If you need to scale or want SQL features, you can easily upgrade to:

**Recommended Options:**
1. **SQLite** (Simple, file-based)
   - No server required
   - Good for 100-1000 applications

2. **PostgreSQL** (Production-ready)
   - Robust and scalable
   - Good for 1000+ applications
   - Free and open-source

3. **MySQL/MariaDB**
   - Popular and well-supported
   - Good for any scale

**Migration is straightforward** - The API structure won't change, you'll just swap the file operations with database queries.

### When to upgrade to SQL:
- More than 500 applications
- Need complex queries/reporting
- Multiple simultaneous users
- Need transaction support
- Want better data integrity

## Usage Guide

### Submitting an Application

1. Click "Apply" in the navigation
2. Fill out all 5 tabs:
   - Referring Agency (Agency details, case manager, referral info)
   - Applicant Info (Client details, summary of needs)
   - Financial & Plan (Income, rent, step-down configuration)
   - Monthly Breakdown (Auto-calculated payment schedule)
   - Landlord & Approval (Landlord info, review & submit)
3. Click "Submit Application"
4. Save your Application ID

### Managing Applications (Dashboard)

1. Click "Dashboard" in the navigation
2. View statistics cards showing totals
3. Use filters to find specific applications:
   - Status (Pending/Viewed/Approved/Denied)
   - Agency name
   - Income range
   - Household size
   - Assistance amount range
   - Date range
4. Click "View" to see full application details
5. Approve or Deny applications
6. Export filtered data to CSV

### Custom Reporting

1. Go to Dashboard
2. Apply desired filters
3. Select which fields to include in report
4. Click "Export to CSV"
5. Open in Excel for further analysis

## Customization

### Changing Port Numbers

**Backend Port (default: 3001):**
Edit `backend/server.js`:
```javascript
const PORT = process.env.PORT || 3001;
```

**Frontend API URL:**
Edit both `frontend/src/components/ApplicationForm.jsx` and `Dashboard.jsx`:
```javascript
const API_URL = 'http://localhost:3001/api';
```

### Adding New Fields

1. Add field to form state in `ApplicationForm.jsx`
2. Add input field in appropriate tab
3. Backend will automatically save it
4. Add to `reportFields` in `Dashboard.jsx` for reporting

### Styling

All CSS files are in `frontend/src/styles/`:
- Modify colors, fonts, spacing as needed
- Main color scheme uses `#4472C4` (blue)

## Deployment

### ⭐ Recommended: Vercel (Easiest!)

Deploy both frontend and backend to Vercel in one command:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Or push to GitHub and deploy via Vercel dashboard
```

**See VERCEL_DEPLOYMENT.md for complete step-by-step guide!**

### Other Options

**Option 1: Netlify (Frontend) + Render (Backend)**
- Deploy frontend to Netlify
- Deploy backend to Render.com
- Update API_URL in frontend

**Option 2: Docker**
Create `docker-compose.yml` for both services.

## Backup & Data Safety

**Backup your data regularly:**
```bash
cp /Users/danielschacht/ERF3-website/backend/data/applications.json /path/to/backup/
```

**Recommended:**
- Daily automated backups
- Version control with Git
- Cloud storage for backups

## Troubleshooting

### Backend won't start
- Check if port 3001 is already in use
- Verify Node.js is installed: `node --version`
- Check for errors in terminal

### Frontend won't connect to backend
- Ensure backend is running on port 3001
- Check CORS settings in `backend/server.js`
- Verify API_URL in frontend components

### Applications not saving
- Check `backend/data/` directory exists
- Verify write permissions
- Check backend terminal for errors

## Future Enhancements

Potential additions:
- [ ] User authentication (admin login)
- [ ] Email notifications
- [ ] PDF export of applications
- [ ] File upload (W-9, lease agreements)
- [ ] Batch operations
- [ ] Advanced analytics dashboard
- [ ] Calendar integration for payment schedules
- [ ] Client portal (track their application)

## Support

For issues or questions:
1. Check this README
2. Review error messages in browser console
3. Check backend terminal for API errors
4. Review the code comments

## License

Internal use for ERF3 Grant Funding program.

---

**Created:** November 2025
**Version:** 1.0.0
**Status:** Production Ready
