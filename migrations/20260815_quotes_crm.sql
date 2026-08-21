DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'quotes_status_enum') THEN
    CREATE TYPE quotes_status_enum AS ENUM (
      'NEW',
      'CONTACTED',
      'QUOTED',
      'FOLLOW_UP',
      'NEGOTIATION',
      'WON',
      'LOST',
      'EXPIRED'
    );
  END IF;
END $$;

ALTER TYPE quotes_status_enum ADD VALUE IF NOT EXISTS 'NEW';
ALTER TYPE quotes_status_enum ADD VALUE IF NOT EXISTS 'CONTACTED';
ALTER TYPE quotes_status_enum ADD VALUE IF NOT EXISTS 'QUOTED';
ALTER TYPE quotes_status_enum ADD VALUE IF NOT EXISTS 'FOLLOW_UP';
ALTER TYPE quotes_status_enum ADD VALUE IF NOT EXISTS 'NEGOTIATION';
ALTER TYPE quotes_status_enum ADD VALUE IF NOT EXISTS 'WON';
ALTER TYPE quotes_status_enum ADD VALUE IF NOT EXISTS 'LOST';
ALTER TYPE quotes_status_enum ADD VALUE IF NOT EXISTS 'EXPIRED';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quotes') THEN
    CREATE TABLE quotes (
      id SERIAL PRIMARY KEY,
      client_id INTEGER NOT NULL,
      vehicle_id INTEGER NOT NULL,
      user_id INTEGER NULL,
      quoted_price NUMERIC(12,2) NOT NULL,
      valid_until DATE NULL,
      source VARCHAR(80) NULL,
      payment_method VARCHAR(80) NULL,
      down_payment NUMERIC(12,2) NULL,
      financing_details TEXT NULL,
      notes TEXT NULL,
      next_follow_up_at TIMESTAMP NULL,
      lost_reason TEXT NULL,
      status quotes_status_enum NOT NULL DEFAULT 'NEW',
      created_at TIMESTAMP NOT NULL DEFAULT now(),
      updated_at TIMESTAMP NOT NULL DEFAULT now()
    );
  END IF;
END $$;

ALTER TABLE quotes ADD COLUMN IF NOT EXISTS client_id INTEGER;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS vehicle_id INTEGER;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS user_id INTEGER;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS quoted_price NUMERIC(12,2);
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS valid_until DATE;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS source VARCHAR(80);
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS payment_method VARCHAR(80);
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS down_payment NUMERIC(12,2);
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS financing_details TEXT;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS next_follow_up_at TIMESTAMP;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS lost_reason TEXT;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT now();

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quotes' AND column_name = 'clientId') THEN
    UPDATE quotes SET client_id = COALESCE(client_id, "clientId");
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quotes' AND column_name = 'vehicleId') THEN
    UPDATE quotes SET vehicle_id = COALESCE(vehicle_id, "vehicleId");
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quotes' AND column_name = 'userId') THEN
    UPDATE quotes SET user_id = COALESCE(user_id, "userId");
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quotes' AND column_name = 'final_price') THEN
    UPDATE quotes SET quoted_price = COALESCE(quoted_price, final_price);
  ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quotes' AND column_name = 'finalPrice') THEN
    UPDATE quotes SET quoted_price = COALESCE(quoted_price, "finalPrice");
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quotes' AND column_name = 'status') THEN
    UPDATE quotes
    SET status = CASE status::text
      WHEN 'DRAFT' THEN 'NEW'
      WHEN 'SENT' THEN 'QUOTED'
      WHEN 'ACCEPTED' THEN 'WON'
      WHEN 'REJECTED' THEN 'LOST'
      ELSE status::text
    END::quotes_status_enum;
  END IF;
END $$;

UPDATE quotes SET quoted_price = 0 WHERE quoted_price IS NULL;
ALTER TABLE quotes ALTER COLUMN client_id SET NOT NULL;
ALTER TABLE quotes ALTER COLUMN vehicle_id SET NOT NULL;
ALTER TABLE quotes ALTER COLUMN quoted_price SET NOT NULL;
ALTER TABLE quotes ALTER COLUMN status SET DEFAULT 'NEW';
ALTER TABLE quotes ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE quotes ALTER COLUMN updated_at SET DEFAULT now();

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'quote_activities_type_enum') THEN
    CREATE TYPE quote_activities_type_enum AS ENUM (
      'NOTE',
      'CALL',
      'WHATSAPP',
      'EMAIL',
      'MEETING',
      'STATUS_CHANGE',
      'TASK'
    );
  END IF;
END $$;

ALTER TYPE quote_activities_type_enum ADD VALUE IF NOT EXISTS 'NOTE';
ALTER TYPE quote_activities_type_enum ADD VALUE IF NOT EXISTS 'CALL';
ALTER TYPE quote_activities_type_enum ADD VALUE IF NOT EXISTS 'WHATSAPP';
ALTER TYPE quote_activities_type_enum ADD VALUE IF NOT EXISTS 'EMAIL';
ALTER TYPE quote_activities_type_enum ADD VALUE IF NOT EXISTS 'MEETING';
ALTER TYPE quote_activities_type_enum ADD VALUE IF NOT EXISTS 'STATUS_CHANGE';
ALTER TYPE quote_activities_type_enum ADD VALUE IF NOT EXISTS 'TASK';

CREATE TABLE IF NOT EXISTS quote_activities (
  id SERIAL PRIMARY KEY,
  quote_id INTEGER NOT NULL,
  created_by_id INTEGER NULL,
  type quote_activities_type_enum NOT NULL DEFAULT 'NOTE',
  title VARCHAR(180) NOT NULL,
  description TEXT NULL,
  due_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_quotes_client') THEN
    ALTER TABLE quotes ADD CONSTRAINT fk_quotes_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_quotes_vehicle') THEN
    ALTER TABLE quotes ADD CONSTRAINT fk_quotes_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE RESTRICT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_quotes_user') THEN
    ALTER TABLE quotes ADD CONSTRAINT fk_quotes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_quote_activities_quote') THEN
    ALTER TABLE quote_activities ADD CONSTRAINT fk_quote_activities_quote FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_quote_activities_created_by') THEN
    ALTER TABLE quote_activities ADD CONSTRAINT fk_quote_activities_created_by FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_client_id ON quotes(client_id);
CREATE INDEX IF NOT EXISTS idx_quotes_vehicle_id ON quotes(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_quotes_user_id ON quotes(user_id);
CREATE INDEX IF NOT EXISTS idx_quotes_next_follow_up_at ON quotes(next_follow_up_at);
CREATE INDEX IF NOT EXISTS idx_quote_activities_quote_id ON quote_activities(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_activities_due_at ON quote_activities(due_at);
