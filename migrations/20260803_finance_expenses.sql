-- Modulo de gastos generales con categorias para reportes financieros.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type
    WHERE typname = 'expenses_status_enum'
  ) THEN
    CREATE TYPE expenses_status_enum AS ENUM (
      'PENDING',
      'PAID',
      'CANCELLED'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS expense_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE,
  description TEXT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL REFERENCES expense_categories(id) ON DELETE RESTRICT,
  description VARCHAR(255) NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  status expenses_status_enum NOT NULL DEFAULT 'PENDING',
  expense_date TIMESTAMP NOT NULL DEFAULT NOW(),
  supplier_name VARCHAR(150) NULL,
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expenses_category_id_status
  ON expenses (category_id, status);
CREATE INDEX IF NOT EXISTS idx_expenses_expense_date
  ON expenses (expense_date);
