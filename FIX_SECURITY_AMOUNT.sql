-- Add the missing security_amount column
ALTER TABLE applications ADD COLUMN IF NOT EXISTS security_amount DECIMAL(10, 2);
