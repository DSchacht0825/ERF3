-- Add all missing columns to applications table
-- Run this in Supabase SQL Editor

ALTER TABLE applications ADD COLUMN IF NOT EXISTS current_income DECIMAL(10, 2);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS projected_income DECIMAL(10, 2);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS primary_income_source VARCHAR(255);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS rent_due_day VARCHAR(10);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS step_down_rationale TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS phases JSONB;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS landlord_company VARCHAR(255);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS payment_address TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS w9_on_file VARCHAR(10);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS landlord_agreement_signed VARCHAR(10);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS include_security_deposit VARCHAR(10);

-- Add calculated/total fields
ALTER TABLE applications ADD COLUMN IF NOT EXISTS total_months INTEGER;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS total_rental_assistance DECIMAL(10, 2);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS total_security_deposit DECIMAL(10, 2);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS total_assistance_requested DECIMAL(10, 2);
