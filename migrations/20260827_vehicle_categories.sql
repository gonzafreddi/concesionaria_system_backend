DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vehicles_category_enum') THEN
    CREATE TYPE vehicles_category_enum AS ENUM ('CAR', 'MOTORCYCLE', 'PICKUP', 'TRUCK', 'MACHINERY', 'OTHER');
  END IF;
END $$;

ALTER TABLE vehicles
  ADD COLUMN IF NOT EXISTS category vehicles_category_enum NOT NULL DEFAULT 'CAR';
