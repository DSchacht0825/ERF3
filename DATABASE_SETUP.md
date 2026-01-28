# Database Setup Guide

The Vista CAREs application now uses **PostgreSQL** via Vercel Postgres for persistent data storage.

## Quick Setup on Vercel

### Step 1: Create Postgres Database on Vercel

1. Go to your Vercel Dashboard: https://vercel.com/dashboard
2. Select your Vista CAREs project
3. Click on the **"Storage"** tab
4. Click **"Create Database"**
5. Select **"Postgres"**
6. Choose a database name (e.g., `erf3-applications`)
7. Select a region (choose closest to your users)
8. Click **"Create"**

### Step 2: Connect Database to Project

Vercel will automatically:
- Create the database
- Add environment variables to your project:
  - `POSTGRES_URL`
  - `POSTGRES_PRISMA_URL`
  - `POSTGRES_URL_NON_POOLING`
  - `POSTGRES_USER`
  - `POSTGRES_HOST`
  - `POSTGRES_PASSWORD`
  - `POSTGRES_DATABASE`

### Step 3: Deploy

1. Push your latest code to GitHub (if not already done):
   ```bash
   git push
   ```

2. Vercel will automatically redeploy with the database connected

3. The database tables will be created automatically on first deployment

### Step 4: Verify Database Connection

Visit your deployed application's health check:
```
https://your-app.vercel.app/api/health
```

You should see:
```json
{
  "status": "OK",
  "message": "Vista CAREs API is running",
  "database": "connected"
}
```

## Database Schema

The application automatically creates the following table on first run:

### `applications` Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (auto-generated) |
| application_id | VARCHAR(50) | Unique application ID (e.g., Vista CAREs-2025-0001) |
| submitted_date | TIMESTAMP | When application was submitted |
| status | VARCHAR(20) | pending, viewed, approved, or denied |
| viewed_date | TIMESTAMP | When first viewed |
| reviewed_by | VARCHAR(255) | Who reviewed the application |
| approval_date | TIMESTAMP | When approved |
| denial_date | TIMESTAMP | When denied |
| ... | ... | (50+ fields for application data) |
| monthly_breakdown | JSONB | Monthly payment plan as JSON |
| notes | JSONB | Admin notes array |
| created_at | TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | Last update time |

Full schema available in: `backend/schema.sql`

## Local Development Setup

### Option 1: Use Vercel Postgres Locally (Recommended)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Link your local project to Vercel:
   ```bash
   vercel link
   ```

3. Pull environment variables:
   ```bash
   vercel env pull .env
   ```

4. Start the backend:
   ```bash
   cd backend
   npm run dev
   ```

### Option 2: Use Local PostgreSQL

1. Install PostgreSQL locally
2. Create a database:
   ```sql
   CREATE DATABASE erf3_applications;
   ```

3. Create `.env` file in `/backend`:
   ```env
   POSTGRES_URL=postgres://username:password@localhost:5432/erf3_applications
   ```

4. Run the schema:
   ```bash
   psql -U username -d erf3_applications -f backend/schema.sql
   ```

5. Start the backend:
   ```bash
   cd backend
   npm run dev
   ```

## Data Migration (From JSON to PostgreSQL)

If you have existing applications in the old JSON format, you can migrate them:

### Manual Migration

1. Export existing data from `/backend/data/applications.json`
2. Use a PostgreSQL client or script to insert the data
3. Ensure all field names are converted from camelCase to snake_case

Example conversion:
```javascript
// camelCase (JSON) → snake_case (PostgreSQL)
applicantName → applicant_name
monthlyIncome → monthly_income
totalAssistanceNeeded → total_assistance_needed
```

## Database Management

### View Applications via Vercel Dashboard

1. Go to Vercel Dashboard → Your Project → Storage
2. Select your Postgres database
3. Click **"Data"** tab
4. Run queries directly in the browser

### Common Queries

**View all applications:**
```sql
SELECT application_id, applicant_name, status, submitted_date
FROM applications
ORDER BY submitted_date DESC;
```

**Count by status:**
```sql
SELECT status, COUNT(*)
FROM applications
GROUP BY status;
```

**Total assistance requested:**
```sql
SELECT
  status,
  COUNT(*) as count,
  SUM(total_assistance_needed) as total_amount
FROM applications
GROUP BY status;
```

### Backup Your Database

**Via Vercel Dashboard:**
1. Storage → Your Database → Backups
2. Vercel provides automatic daily backups

**Via pg_dump (local):**
```bash
pg_dump -h your-postgres-host -U username -d dbname > backup.sql
```

## Troubleshooting

### "Database disconnected" Error

1. Check environment variables are set in Vercel
2. Verify database is running in Vercel Storage tab
3. Check connection limits (Vercel Postgres has connection limits per plan)

### "Table does not exist" Error

The table should create automatically. If not:
1. Run the schema manually via Vercel Dashboard → Data → Query
2. Copy/paste contents of `backend/schema.sql`
3. Execute the query

### Connection Timeout

- Vercel Postgres has connection limits
- Use connection pooling (automatically handled by `@vercel/postgres`)
- Consider upgrading Vercel plan if hitting limits

## Performance Optimization

### Indexes

The following indexes are automatically created:
- `idx_application_id` - Fast lookup by application ID
- `idx_status` - Fast filtering by status
- `idx_submitted_date` - Fast sorting by date
- `idx_applicant_name` - Fast search by name

### Query Optimization

- Dashboard loads all applications in one query
- Statistics calculated with SQL aggregations
- JSONB fields allow flexible data storage without schema changes

## Security

- Database credentials stored as environment variables (never in code)
- Vercel automatically manages SSL connections
- PostgreSQL uses parameterized queries (prevents SQL injection)
- Row-level security can be added if needed

## Scaling

**Current Setup:**
- ✅ Handles thousands of applications
- ✅ Fast queries with proper indexing
- ✅ JSONB for flexible data storage

**Future Enhancements:**
- Add full-text search for applicant names
- Implement soft deletes (keep deleted records)
- Add audit logging table
- Add user authentication table
- Implement role-based access control

## Cost

**Vercel Postgres Pricing:**
- **Hobby Plan**: Free tier available (limited storage/bandwidth)
- **Pro Plan**: Starts at $20/month (1 GB storage, 1 GB transfer)
- **Enterprise**: Custom pricing

Check current pricing: https://vercel.com/docs/storage/vercel-postgres/usage-and-pricing
