-- Agrega concepto de pago para distinguir seña, entrega inicial, contado, etc.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type
    WHERE typname = 'payments_concept_enum'
  ) THEN
    CREATE TYPE payments_concept_enum AS ENUM (
      'RESERVATION',
      'DOWN_PAYMENT',
      'PARTIAL_PAYMENT',
      'FULL_PAYMENT',
      'TRADE_COMPLEMENT',
      'OTHER'
    );
  END IF;
END $$;

ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS concept payments_concept_enum NOT NULL DEFAULT 'PARTIAL_PAYMENT';
