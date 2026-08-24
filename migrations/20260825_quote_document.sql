ALTER TYPE generated_documents_related_entity_type_enum ADD VALUE IF NOT EXISTS 'QUOTE';

ALTER TABLE quotes ADD COLUMN IF NOT EXISTS document_id UUID NULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_quotes_document') THEN
    ALTER TABLE quotes ADD CONSTRAINT fk_quotes_document FOREIGN KEY (document_id) REFERENCES generated_documents(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_quotes_document_id ON quotes(document_id);
