ALTER TABLE agency_settings
ADD COLUMN IF NOT EXISTS consignment_early_termination_fee DECIMAL(12, 2) NULL;
