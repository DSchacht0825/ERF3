const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { sql } = require('@vercel/postgres');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Helper function to convert camelCase to snake_case
function toSnakeCase(str) {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
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
        lease_start_date DATE,
        lease_end_date DATE,
        lease_term_months INTEGER,
        total_assistance_needed DECIMAL(10, 2),
        step_down_months INTEGER,
        step_down_plan TEXT,
        employment_status VARCHAR(100),
        employment_start_date DATE,
        expected_income_increase DECIMAL(10, 2),
        barriers_to_housing TEXT,
        support_services_needed TEXT,
        long_term_housing_plan TEXT,

        monthly_breakdown JSONB,

        landlord_name VARCHAR(255),
        landlord_phone VARCHAR(20),
        landlord_email VARCHAR(255),
        landlord_address TEXT,
        property_address TEXT,
        property_city VARCHAR(100),
        property_state VARCHAR(2),
        property_zip VARCHAR(10),
        rent_amount DECIMAL(10, 2),
        security_deposit DECIMAL(10, 2),
        landlord_agreed BOOLEAN,
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

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Routes

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await sql`SELECT 1`;
    res.json({ status: 'OK', message: 'ERF3 API is running', database: 'connected' });
  } catch (error) {
    res.json({ status: 'OK', message: 'ERF3 API is running', database: 'disconnected' });
  }
});

// Get all applications
app.get('/api/applications', async (req, res) => {
  try {
    const result = await sql`
      SELECT * FROM applications
      ORDER BY submitted_date DESC
    `;

    const applications = result.rows.map(row => convertKeysToCamel(row));
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

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const application = convertKeysToCamel(result.rows[0]);
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

    // Get current count for generating application ID
    const countResult = await sql`SELECT COUNT(*) as count FROM applications`;
    const count = parseInt(countResult.rows[0].count);
    const applicationId = `ERF3-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    console.log(`Creating application ${applicationId}`);

    // Convert camelCase keys to snake_case
    const snakeData = convertKeysToSnake(req.body);

    // Build the insert query dynamically
    const fields = ['application_id', 'status'];
    const values = [applicationId, 'pending'];

    // Add all fields from request body
    for (const [key, value] of Object.entries(snakeData)) {
      if (value !== undefined && value !== null && value !== '') {
        fields.push(key);
        values.push(value);
      }
    }

    // Create placeholders for parameterized query
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    const fieldNames = fields.join(', ');

    const result = await sql.query(
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

    const result = await sql.query(updateQuery, params);

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

    const result = await sql.query(updateQuery, params);

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

    if (result.rows.length === 0) {
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
        COALESCE(SUM(total_assistance_needed), 0) as total_requested,
        COALESCE(SUM(total_assistance_needed) FILTER (WHERE status = 'approved'), 0) as total_approved
      FROM applications
    `;

    const stats = {
      total: parseInt(result.rows[0].total),
      pending: parseInt(result.rows[0].pending),
      viewed: parseInt(result.rows[0].viewed),
      approved: parseInt(result.rows[0].approved),
      denied: parseInt(result.rows[0].denied),
      totalRequested: parseFloat(result.rows[0].total_requested),
      totalApproved: parseFloat(result.rows[0].total_approved)
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
      console.log(`ERF3 API Server running on http://localhost:${PORT}`);
      console.log('Using PostgreSQL database');
    });
  });
} else {
  // Production (Vercel)
  initializeDatabase();
}

// Export for Vercel serverless
module.exports = app;
