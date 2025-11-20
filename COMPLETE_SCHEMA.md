# Complete Database Schema - ALL Fields

## Run this in Supabase SQL Editor to recreate the table properly

**This will DROP the existing table and create a NEW one with ALL fields.**

```sql
-- Drop existing table
DROP TABLE IF EXISTS applications CASCADE;

-- Create complete applications table with ALL form fields
CREATE TABLE applications (
  -- System fields
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
  monthly_rent DECIMAL(10, 2),
  security_deposit DECIMAL(10, 2),
  include_security_deposit VARCHAR(10),
  current_income DECIMAL(10, 2),
  projected_income DECIMAL(10, 2),
  primary_income_source VARCHAR(255),
  lease_start_date DATE,
  lease_end_date DATE,
  rent_due_day VARCHAR(10),

  -- Step-down plan
  phases JSONB,
  step_down_rationale TEXT,

  -- Calculated totals
  total_months INTEGER,
  total_rental_assistance DECIMAL(10, 2),
  total_security_deposit DECIMAL(10, 2),
  total_assistance_requested DECIMAL(10, 2),

  -- Tab 4: Monthly Breakdown
  monthly_breakdown JSONB,

  -- Tab 5: Landlord & Approval
  landlord_name VARCHAR(255),
  landlord_company VARCHAR(255),
  landlord_phone VARCHAR(20),
  landlord_email VARCHAR(255),
  property_address TEXT,
  payment_address TEXT,
  w9_on_file VARCHAR(10),
  landlord_agreement_signed VARCHAR(10),

  -- Admin notes
  notes JSONB DEFAULT '[]'::JSONB,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_application_id ON applications(application_id);
CREATE INDEX idx_status ON applications(status);
CREATE INDEX idx_submitted_date ON applications(submitted_date DESC);
CREATE INDEX idx_applicant_name ON applications(applicant_name);
```

## Instructions

1. **IMPORTANT:** This will delete all existing data in the applications table
2. Copy the SQL above
3. Go to Supabase SQL Editor
4. Paste and click **Run**
5. Done - ALL fields are now in the database

## What This Includes

✅ All 40+ form fields
✅ Calculated totals (total_months, total_rental_assistance, etc.)
✅ JSONB fields (phases, monthly_breakdown, notes)
✅ Proper data types for everything
✅ All indexes for performance

**No more missing columns!**
