BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'purchase_status_enum'
  ) THEN
    CREATE TYPE purchase_status_enum AS ENUM (
      'DRAFT',
      'DOCUMENTS_PENDING',
      'COMPLETED',
      'CANCELLED'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS purchases (
  id SERIAL PRIMARY KEY,
  client_id INT NOT NULL,
  vehicle_id INT NOT NULL UNIQUE,
  status purchase_status_enum NOT NULL DEFAULT 'DRAFT',
  agreed_price NUMERIC(12, 2) NOT NULL,
  notes TEXT NULL,
  purchase_date TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_purchases_client_id ON purchases(client_id);
CREATE INDEX IF NOT EXISTS idx_purchases_vehicle_id ON purchases(vehicle_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_purchases_client'
  ) THEN
    ALTER TABLE purchases
      ADD CONSTRAINT fk_purchases_client
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_purchases_vehicle'
  ) THEN
    ALTER TABLE purchases
      ADD CONSTRAINT fk_purchases_vehicle
      FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE RESTRICT;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'documents'
  ) THEN
    ALTER TABLE documents
      ADD COLUMN IF NOT EXISTS purchase_id INT NULL;

    CREATE INDEX IF NOT EXISTS idx_documents_purchase_id ON documents(purchase_id);

    IF NOT EXISTS (
      SELECT 1
      FROM pg_constraint
      WHERE conname = 'fk_documents_purchase'
    ) THEN
      ALTER TABLE documents
        ADD CONSTRAINT fk_documents_purchase
        FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

COMMIT;
