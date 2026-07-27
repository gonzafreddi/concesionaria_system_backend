-- Registra gastos asociados a un vehículo para calcular costo real y margen.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type
    WHERE typname = 'vehicle_expenses_type_enum'
  ) THEN
    CREATE TYPE vehicle_expenses_type_enum AS ENUM (
      'MECHANICAL',
      'BODYWORK',
      'DOCUMENTATION',
      'CLEANING',
      'TRANSFER',
      'OTHER'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type
    WHERE typname = 'vehicle_expenses_status_enum'
  ) THEN
    CREATE TYPE vehicle_expenses_status_enum AS ENUM (
      'PENDING',
      'PAID',
      'CANCELLED'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS vehicle_expenses (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  type vehicle_expenses_type_enum NOT NULL,
  description VARCHAR(255) NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  status vehicle_expenses_status_enum NOT NULL DEFAULT 'PENDING',
  expense_date TIMESTAMP NOT NULL DEFAULT NOW(),
  supplier_name VARCHAR(150) NULL,
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vehicle_expenses_vehicle_id_status
  ON vehicle_expenses (vehicle_id, status);
CREATE INDEX IF NOT EXISTS idx_vehicle_expenses_vehicle_id_type
  ON vehicle_expenses (vehicle_id, type);
