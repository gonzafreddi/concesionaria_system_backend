ALTER TABLE vehicles
  ADD COLUMN IF NOT EXISTS chassis_number varchar NULL,
  ADD COLUMN IF NOT EXISTS engine_number varchar NULL;

ALTER TABLE inspections
  ADD COLUMN IF NOT EXISTS appraiser varchar NULL;
