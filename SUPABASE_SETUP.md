# Supabase Database Setup

## Complete SQL Schema

Copy the SQL below and paste it into Supabase SQL Editor, then click Run.

```sql
-- Drop existing table if it exists
DROP TABLE IF EXISTS applications CASCADE;

-- Create applications table with all fields
CREATE TABLE applications (
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
);

-- Create indexes for better query performance
CREATE INDEX idx_application_id ON applications(application_id);
CREATE INDEX idx_status ON applications(status);
CREATE INDEX idx_submitted_date ON applications(submitted_date DESC);
CREATE INDEX idx_applicant_name ON applications(applicant_name);
```

## Instructions

1. Go to Supabase dashboard: https://console.supabase.com
2. Select your project
3. Click **SQL Editor** (left sidebar)
4. Click **New query**
5. Copy the SQL above from this file
6. Paste into SQL Editor
7. Click **Run**
8. You should see: "Success. No rows returned"

Done! Your database is ready.
