const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Supabase PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 10
});

// Helper function to execute queries
async function sql(strings, ...values) {
  const query = strings.reduce((acc, str, i) => {
    return acc + str + (values[i] !== undefined ? `$${i + 1}` : '');
  }, '');
  const result = await pool.query(query, values);
  return result.rows;
}

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Helper function to convert camelCase to snake_case
function toSnakeCase(str) {
  return str
    // Handle acronyms (DOB, SSN, etc.) - don't split them
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
    // Insert underscore before capital letters
    .replace(/([a-z\d])([A-Z])/g, '$1_$2')
    // Convert to lowercase
    .toLowerCase();
}

// Helper function to convert snake_case to camelCase
function toCamelCase(str) {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

// Convert object keys from camelCase to snake_case
function convertKeysToSnake(obj) {
  const result = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      result[toSnakeCase(key)] = obj[key];
    }
  }
  return result;
}

// Convert object keys from snake_case to camelCase
function convertKeysToCamel(obj) {
  const result = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      result[toCamelCase(key)] = obj[key];
    }
  }
  return result;
}

// Initialize database table
async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    await sql`
      CREATE TABLE IF NOT EXISTS applications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        application_id VARCHAR(50) UNIQUE NOT NULL,
        submitted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) DEFAULT 'pending',
        viewed_date TIMESTAMP,
        reviewed_by VARCHAR(255),
        approval_date TIMESTAMP,
        denial_date TIMESTAMP,

        application_date DATE,
        agency_name VARCHAR(255),
        agency_address TEXT,
        agency_city VARCHAR(100),
        agency_state VARCHAR(2),
        agency_zip VARCHAR(10),
        agency_phone VARCHAR(20),
        agency_email VARCHAR(255),
        agency_website VARCHAR(255),
        agency_tax_id VARCHAR(50),
        case_manager_name VARCHAR(255),
        case_manager_title VARCHAR(100),
        case_manager_phone VARCHAR(20),
        case_manager_email VARCHAR(255),
        case_manager_availability TEXT,
        alternate_contact_name VARCHAR(255),
        alternate_contact_phone VARCHAR(20),
        alternate_contact_email VARCHAR(255),
        referral_date DATE,
        referring_program VARCHAR(255),
        client_id_number VARCHAR(50),
        length_of_service VARCHAR(100),
        program_enrollment_status VARCHAR(100),
        additional_services TEXT,
        agency_coordination TEXT,

        applicant_name VARCHAR(255),
        applicant_dob DATE,
        applicant_ssn VARCHAR(20),
        applicant_phone VARCHAR(20),
        applicant_email VARCHAR(255),
        applicant_address TEXT,
        household_size INTEGER,
        number_of_children INTEGER,
        emergency_contact_name VARCHAR(255),
        emergency_contact_phone VARCHAR(20),
        summary_of_needs TEXT,

        monthly_income DECIMAL(10, 2),
        income_source VARCHAR(255),
        monthly_rent DECIMAL(10, 2),
        monthly_utilities DECIMAL(10, 2),
        other_monthly_expenses DECIMAL(10, 2),
        total_monthly_expenses DECIMAL(10, 2),
        budget_surplus_deficit DECIMAL(10, 2),
        current_income DECIMAL(10, 2),
        projected_income DECIMAL(10, 2),
        primary_income_source VARCHAR(255),
        lease_start_date DATE,
        lease_end_date DATE,
        lease_term_months INTEGER,
        rent_due_day VARCHAR(10),
        include_security_deposit VARCHAR(10),
        total_assistance_needed DECIMAL(10, 2),
        step_down_months INTEGER,
        step_down_plan TEXT,
        step_down_rationale TEXT,
        phases JSONB,
        employment_status VARCHAR(100),
        employment_start_date DATE,
        expected_income_increase DECIMAL(10, 2),
        barriers_to_housing TEXT,
        support_services_needed TEXT,
        long_term_housing_plan TEXT,

        monthly_breakdown JSONB,

        -- Calculated totals
        total_months INTEGER,
        total_rental_assistance DECIMAL(10, 2),
        security_amount DECIMAL(10, 2),
        total_assistance_requested DECIMAL(10, 2),

        landlord_name VARCHAR(255),
        landlord_company VARCHAR(255),
        landlord_phone VARCHAR(20),
        landlord_email VARCHAR(255),
        landlord_address TEXT,
        payment_address TEXT,
        property_address TEXT,
        property_city VARCHAR(100),
        property_state VARCHAR(2),
        property_zip VARCHAR(10),
        rent_amount DECIMAL(10, 2),
        security_deposit DECIMAL(10, 2),
        landlord_agreed BOOLEAN,
        landlord_agreement_signed VARCHAR(10),
        w9_on_file VARCHAR(10),
        landlord_signature VARCHAR(255),
        landlord_signature_date DATE,
        applicant_signature VARCHAR(255),
        applicant_signature_date DATE,
        case_manager_signature VARCHAR(255),
        case_manager_signature_date DATE,

        notes JSONB DEFAULT '[]'::JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_application_id ON applications(application_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_status ON applications(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_submitted_date ON applications(submitted_date DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_applicant_name ON applications(applicant_name)`;

    // Add missing columns to existing tables (safe to run multiple times)
    const missingColumns = [
      // Original schema columns that may be missing from early table creation
      { name: 'monthly_income', type: 'DECIMAL(10, 2)' },
      { name: 'income_source', type: 'VARCHAR(255)' },
      { name: 'monthly_utilities', type: 'DECIMAL(10, 2)' },
      { name: 'other_monthly_expenses', type: 'DECIMAL(10, 2)' },
      { name: 'total_monthly_expenses', type: 'DECIMAL(10, 2)' },
      { name: 'budget_surplus_deficit', type: 'DECIMAL(10, 2)' },
      { name: 'lease_term_months', type: 'INTEGER' },
      { name: 'total_assistance_needed', type: 'DECIMAL(10, 2)' },
      { name: 'step_down_months', type: 'INTEGER' },
      { name: 'step_down_plan', type: 'TEXT' },
      { name: 'employment_status', type: 'VARCHAR(100)' },
      { name: 'employment_start_date', type: 'DATE' },
      { name: 'expected_income_increase', type: 'DECIMAL(10, 2)' },
      { name: 'barriers_to_housing', type: 'TEXT' },
      { name: 'support_services_needed', type: 'TEXT' },
      { name: 'long_term_housing_plan', type: 'TEXT' },
      { name: 'landlord_address', type: 'TEXT' },
      { name: 'property_city', type: 'VARCHAR(100)' },
      { name: 'property_state', type: 'VARCHAR(2)' },
      { name: 'property_zip', type: 'VARCHAR(10)' },
      { name: 'rent_amount', type: 'DECIMAL(10, 2)' },
      { name: 'landlord_agreed', type: 'BOOLEAN' },
      { name: 'landlord_signature', type: 'VARCHAR(255)' },
      { name: 'landlord_signature_date', type: 'DATE' },
      { name: 'applicant_signature', type: 'VARCHAR(255)' },
      { name: 'applicant_signature_date', type: 'DATE' },
      { name: 'case_manager_signature', type: 'VARCHAR(255)' },
      { name: 'case_manager_signature_date', type: 'DATE' },
      // New columns added for form fields
      { name: 'current_income', type: 'DECIMAL(10, 2)' },
      { name: 'projected_income', type: 'DECIMAL(10, 2)' },
      { name: 'primary_income_source', type: 'VARCHAR(255)' },
      { name: 'rent_due_day', type: 'VARCHAR(10)' },
      { name: 'include_security_deposit', type: 'VARCHAR(10)' },
      { name: 'step_down_rationale', type: 'TEXT' },
      { name: 'phases', type: 'JSONB' },
      { name: 'total_months', type: 'INTEGER' },
      { name: 'total_rental_assistance', type: 'DECIMAL(10, 2)' },
      { name: 'security_amount', type: 'DECIMAL(10, 2)' },
      { name: 'total_assistance_requested', type: 'DECIMAL(10, 2)' },
      { name: 'landlord_company', type: 'VARCHAR(255)' },
      { name: 'payment_address', type: 'TEXT' },
      { name: 'w9_on_file', type: 'VARCHAR(10)' },
      { name: 'landlord_agreement_signed', type: 'VARCHAR(10)' },
    ];

    for (const col of missingColumns) {
      try {
        await pool.query(`ALTER TABLE applications ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`);
      } catch (e) {
        // Column may already exist, ignore
      }
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Routes

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'OK', message: 'Vista CAREs API is running', database: 'connected (Supabase)' });
  } catch (error) {
    console.error('Database connection error:', error);
    res.json({ status: 'OK', message: 'Vista CAREs API is running', database: 'disconnected' });
  }
});

// Get all applications
app.get('/api/applications', async (req, res) => {
  try {
    const result = await sql`
      SELECT * FROM applications
      ORDER BY submitted_date DESC
    `;

    const applications = result.map(row => convertKeysToCamel(row));
    res.json(applications);
  } catch (error) {
    console.error('Error retrieving applications:', error);
    res.status(500).json({ error: 'Failed to retrieve applications', details: error.message });
  }
});

// Get single application by ID
app.get('/api/applications/:id', async (req, res) => {
  try {
    const result = await sql`
      SELECT * FROM applications
      WHERE id = ${req.params.id}
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const application = convertKeysToCamel(result[0]);
    res.json(application);
  } catch (error) {
    console.error('Error retrieving application:', error);
    res.status(500).json({ error: 'Failed to retrieve application', details: error.message });
  }
});

// Create new application
app.post('/api/applications', async (req, res) => {
  try {
    console.log('Received application submission');

    // Get next application number using MAX to avoid duplicates when apps are deleted
    const maxResult = await pool.query(
      `SELECT COALESCE(MAX(CAST(SUBSTRING(application_id FROM '[0-9]+$') AS INTEGER)), 0) as max_num FROM applications`
    );
    const nextNum = parseInt(maxResult.rows[0].max_num) + 1;
    const applicationId = `Vista CAREs-${new Date().getFullYear()}-${String(nextNum).padStart(4, '0')}`;

    console.log(`Creating application ${applicationId}`);

    // Convert camelCase keys to snake_case
    const snakeData = convertKeysToSnake(req.body);

    // Build the insert query dynamically
    const fields = ['application_id', 'status'];
    const values = [applicationId, 'pending'];

    // JSONB fields that need to be stringified
    const jsonbFields = ['phases', 'monthly_breakdown', 'notes'];

    // Add all fields from request body
    for (const [key, value] of Object.entries(snakeData)) {
      if (value !== undefined && value !== null && value !== '') {
        fields.push(key);

        // Stringify JSONB fields
        if (jsonbFields.includes(key) && typeof value === 'object') {
          values.push(JSON.stringify(value));
        } else {
          values.push(value);
        }
      }
    }

    // Create placeholders for parameterized query
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    const fieldNames = fields.join(', ');

    const result = await pool.query(
      `INSERT INTO applications (${fieldNames})
       VALUES (${placeholders})
       RETURNING *`,
      values
    );

    const newApplication = convertKeysToCamel(result.rows[0]);
    console.log('Application saved successfully');

    res.status(201).json(newApplication);
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({ error: 'Failed to create application', details: error.message });
  }
});

// Update application status
app.patch('/api/applications/:id/status', async (req, res) => {
  try {
    const { status, reviewedBy, notes } = req.body;

    let updateQuery = `UPDATE applications SET status = $1, updated_at = CURRENT_TIMESTAMP`;
    let params = [status];
    let paramIndex = 2;

    if (status === 'viewed') {
      updateQuery += `, viewed_date = COALESCE(viewed_date, CURRENT_TIMESTAMP)`;
    }

    if (status === 'approved') {
      updateQuery += `, approval_date = CURRENT_TIMESTAMP, reviewed_by = $${paramIndex}`;
      params.push(reviewedBy);
      paramIndex++;
    }

    if (status === 'denied') {
      updateQuery += `, denial_date = CURRENT_TIMESTAMP, reviewed_by = $${paramIndex}`;
      params.push(reviewedBy);
      paramIndex++;
    }

    if (notes) {
      const note = {
        date: new Date().toISOString(),
        author: reviewedBy || 'System',
        text: notes
      };
      updateQuery += `, notes = COALESCE(notes, '[]'::jsonb) || $${paramIndex}::jsonb`;
      params.push(JSON.stringify(note));
      paramIndex++;
    }

    updateQuery += ` WHERE id = $${paramIndex} RETURNING *`;
    params.push(req.params.id);

    const result = await pool.query(updateQuery, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const updatedApplication = convertKeysToCamel(result.rows[0]);
    res.json(updatedApplication);
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ error: 'Failed to update application status', details: error.message });
  }
});

// Update entire application
app.put('/api/applications/:id', async (req, res) => {
  try {
    const snakeData = convertKeysToSnake(req.body);

    // Build SET clause dynamically
    const setClauses = [];
    const params = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(snakeData)) {
      if (key !== 'id' && value !== undefined) {
        setClauses.push(`${key} = $${paramIndex}`);
        params.push(value);
        paramIndex++;
      }
    }

    setClauses.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(req.params.id);

    const updateQuery = `
      UPDATE applications
      SET ${setClauses.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(updateQuery, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const updatedApplication = convertKeysToCamel(result.rows[0]);
    res.json(updatedApplication);
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ error: 'Failed to update application', details: error.message });
  }
});

// Delete application
app.delete('/api/applications/:id', async (req, res) => {
  try {
    const result = await sql`
      DELETE FROM applications
      WHERE id = ${req.params.id}
      RETURNING id
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ error: 'Failed to delete application', details: error.message });
  }
});

// Get statistics/summary
app.get('/api/statistics', async (req, res) => {
  try {
    const result = await sql`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'viewed') as viewed,
        COUNT(*) FILTER (WHERE status = 'approved') as approved,
        COUNT(*) FILTER (WHERE status = 'denied') as denied,
        COALESCE(SUM(total_assistance_requested), 0) as total_requested,
        COALESCE(SUM(total_assistance_requested) FILTER (WHERE status = 'approved'), 0) as total_approved
      FROM applications
    `;

    const stats = {
      total: parseInt(result[0].total),
      pending: parseInt(result[0].pending),
      viewed: parseInt(result[0].viewed),
      approved: parseInt(result[0].approved),
      denied: parseInt(result[0].denied),
      totalRequested: parseFloat(result[0].total_requested),
      totalApproved: parseFloat(result[0].total_approved)
    };

    res.json(stats);
  } catch (error) {
    console.error('Error calculating statistics:', error);
    res.status(500).json({ error: 'Failed to calculate statistics', details: error.message });
  }
});

// Initialize database and start server
if (process.env.NODE_ENV !== 'production') {
  // Local development
  initializeDatabase().then(() => {
    app.listen(PORT, () => {
      console.log(`Vista CAREs API Server running on http://localhost:${PORT}`);
      console.log('Using PostgreSQL database');
    });
  });
} else {
  // Production (Vercel)
  initializeDatabase();
}

// Export for Vercel serverless
module.exports = app;
