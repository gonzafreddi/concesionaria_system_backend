-- Migracion manual para crear el modulo de documentos.
-- Incluye enums, tabla principal, indices y claves foraneas opcionales.

BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'documents_type_enum'
  ) THEN
    CREATE TYPE documents_type_enum AS ENUM (
      'PURCHASE_AGREEMENT',
      'PAYMENT_RECEIPT',
      'PROFORMA',
      'CONSIGNMENT_CONTRACT',
      'PRE_DELIVERY_CHECKLIST',
      'TRADE_IN_INSPECTION',
      'TRANSFER_COST_ESTIMATE'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'documents_status_enum'
  ) THEN
    CREATE TYPE documents_status_enum AS ENUM (
      'DRAFT',
      'GENERATED',
      'SIGNED',
      'CANCELLED'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  type documents_type_enum NOT NULL,
  status documents_status_enum NOT NULL DEFAULT 'DRAFT',
  title VARCHAR(255) NOT NULL,
  sale_id INTEGER NULL,
  vehicle_id INTEGER NULL,
  payment_id INTEGER NULL,
  client_id INTEGER NULL,
  pdf_data BYTEA NOT NULL,
  signed_pdf_data BYTEA NULL,
  data_snapshot_json JSONB NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_sale_id ON documents (sale_id);
CREATE INDEX IF NOT EXISTS idx_documents_vehicle_id ON documents (vehicle_id);
CREATE INDEX IF NOT EXISTS idx_documents_payment_id ON documents (payment_id);
CREATE INDEX IF NOT EXISTS idx_documents_client_id ON documents (client_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_documents_sale_id'
  ) THEN
    ALTER TABLE documents
      ADD CONSTRAINT fk_documents_sale_id
      FOREIGN KEY (sale_id) REFERENCES sales(id)
      ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_documents_vehicle_id'
  ) THEN
    ALTER TABLE documents
      ADD CONSTRAINT fk_documents_vehicle_id
      FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
      ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_documents_payment_id'
  ) THEN
    ALTER TABLE documents
      ADD CONSTRAINT fk_documents_payment_id
      FOREIGN KEY (payment_id) REFERENCES payments(id)
      ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_documents_client_id'
  ) THEN
    ALTER TABLE documents
      ADD CONSTRAINT fk_documents_client_id
      FOREIGN KEY (client_id) REFERENCES clients(id)
      ON DELETE SET NULL;
  END IF;
END $$;

COMMIT;
