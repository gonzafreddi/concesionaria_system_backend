-- Migracion manual para adaptar el enum de sales.status y agregar
-- los nuevos estados operativos de documentacion y transferencia.
--
-- Mapeo aplicado:
-- DRAFT -> DRAFT
-- RESERVED -> PARTIALLY_PAID
-- SOLD -> CONFIRMED
-- DELIVERED -> CONFIRMED

BEGIN;

ALTER TABLE sales
  ALTER COLUMN status DROP DEFAULT;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'sales_status_enum'
  ) AND NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'sales_status_enum_old'
  ) THEN
    ALTER TYPE sales_status_enum RENAME TO sales_status_enum_old;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'sales_status_enum'
  ) THEN
    CREATE TYPE sales_status_enum AS ENUM (
      'DRAFT',
      'PARTIALLY_PAID',
      'CONFIRMED',
      'CANCELLED'
    );
  END IF;
END $$;

ALTER TABLE sales
  ALTER COLUMN status TYPE sales_status_enum
  USING (
    CASE status::text
      WHEN 'DRAFT' THEN 'DRAFT'
      WHEN 'RESERVED' THEN 'PARTIALLY_PAID'
      WHEN 'SOLD' THEN 'CONFIRMED'
      WHEN 'DELIVERED' THEN 'CONFIRMED'
      WHEN 'PARTIALLY_PAID' THEN 'PARTIALLY_PAID'
      WHEN 'CONFIRMED' THEN 'CONFIRMED'
      WHEN 'CANCELLED' THEN 'CANCELLED'
      ELSE 'DRAFT'
    END
  )::sales_status_enum;

ALTER TABLE sales
  ALTER COLUMN status SET DEFAULT 'DRAFT';

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'sales_status_enum_old'
  ) THEN
    DROP TYPE sales_status_enum_old;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'sales_documentation_status_enum'
  ) THEN
    CREATE TYPE sales_documentation_status_enum AS ENUM (
      'PENDING',
      'IN_PROGRESS',
      'COMPLETED'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'sales_transfer_status_enum'
  ) THEN
    CREATE TYPE sales_transfer_status_enum AS ENUM (
      'NOT_STARTED',
      'IN_PROGRESS',
      'COMPLETED'
    );
  END IF;
END $$;

ALTER TABLE sales
  ADD COLUMN IF NOT EXISTS documentation_status sales_documentation_status_enum
  NOT NULL DEFAULT 'PENDING';

ALTER TABLE sales
  ADD COLUMN IF NOT EXISTS transfer_status sales_transfer_status_enum
  NOT NULL DEFAULT 'NOT_STARTED';

COMMIT;
