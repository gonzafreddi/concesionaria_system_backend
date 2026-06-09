-- Crea la estructura usada por GeneratedDocument.
-- El archivo PDF se conserva temporalmente en PostgreSQL para la salida inicial.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type
    WHERE typname = 'generated_documents_document_type_enum'
  ) THEN
    CREATE TYPE generated_documents_document_type_enum AS ENUM (
      'CONTRACT',
      'RECEIPT',
      'AUTHORIZATION',
      'DELIVERY_NOTE',
      'QUOTE',
      'INTERNAL'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type
    WHERE typname = 'generated_documents_related_entity_type_enum'
  ) THEN
    CREATE TYPE generated_documents_related_entity_type_enum AS ENUM (
      'SALE',
      'PURCHASE',
      'PAYMENT',
      'VEHICLE',
      'CLIENT',
      'CONSIGNMENT'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type
    WHERE typname = 'generated_documents_status_enum'
  ) THEN
    CREATE TYPE generated_documents_status_enum AS ENUM (
      'GENERATED',
      'SIGNED',
      'CANCELLED'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS generated_documents (
  id UUID PRIMARY KEY,
  template_code VARCHAR(100) NOT NULL,
  document_type generated_documents_document_type_enum NOT NULL,
  related_entity_type generated_documents_related_entity_type_enum NOT NULL,
  related_entity_id VARCHAR(100) NOT NULL,
  file_url TEXT NOT NULL,
  file_public_id VARCHAR(255) NULL,
  file_data BYTEA NOT NULL,
  original_file_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size INTEGER NOT NULL CHECK (size >= 0 AND size <= 15728640),
  status generated_documents_status_enum NOT NULL DEFAULT 'GENERATED',
  generated_by_id VARCHAR(100) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_generated_documents_related_entity
  ON generated_documents (related_entity_type, related_entity_id);
CREATE INDEX IF NOT EXISTS idx_generated_documents_type_status
  ON generated_documents (document_type, status);
CREATE INDEX IF NOT EXISTS idx_generated_documents_template_code
  ON generated_documents (template_code);
