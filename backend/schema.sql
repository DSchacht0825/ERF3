-- Vista CAREs Grant Funding Application Database Schema
-- This schema creates the applications table for storing grant applications

CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id VARCHAR(50) UNIQUE NOT NULL,
  submitted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'pending',
  viewed_date TIMESTAMP,
  reviewed_by VARCHAR(255),
  approval_date TIMESTAMP,
  denial_date TIMESTAMP,

  -- Tab 1: Referring Agency
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

  -- Tab 2: Applicant Info
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

  -- Tab 3: Financial & Plan
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

  -- Tab 4: Monthly Breakdown (stored as JSONB for flexibility)
  monthly_breakdown JSONB,

  -- Tab 5: Landlord & Approval
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

  -- Notes (stored as JSONB array)
  notes JSONB DEFAULT '[]'::JSONB,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on application_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_application_id ON applications(application_id);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_status ON applications(status);

-- Create index on submitted_date for sorting
CREATE INDEX IF NOT EXISTS idx_submitted_date ON applications(submitted_date DESC);

-- Create index on applicant_name for searching
CREATE INDEX IF NOT EXISTS idx_applicant_name ON applications(applicant_name);
