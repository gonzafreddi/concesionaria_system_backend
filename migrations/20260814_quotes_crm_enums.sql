DO $$
DECLARE
  enum_exists BOOLEAN;
BEGIN
  SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'quotes_status_enum') INTO enum_exists;

  IF NOT enum_exists THEN
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
  ELSE
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'quotes_status_enum') AND enumlabel = 'NEW') THEN
      ALTER TYPE quotes_status_enum ADD VALUE 'NEW';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'quotes_status_enum') AND enumlabel = 'CONTACTED') THEN
      ALTER TYPE quotes_status_enum ADD VALUE 'CONTACTED';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'quotes_status_enum') AND enumlabel = 'QUOTED') THEN
      ALTER TYPE quotes_status_enum ADD VALUE 'QUOTED';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'quotes_status_enum') AND enumlabel = 'FOLLOW_UP') THEN
      ALTER TYPE quotes_status_enum ADD VALUE 'FOLLOW_UP';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'quotes_status_enum') AND enumlabel = 'NEGOTIATION') THEN
      ALTER TYPE quotes_status_enum ADD VALUE 'NEGOTIATION';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'quotes_status_enum') AND enumlabel = 'WON') THEN
      ALTER TYPE quotes_status_enum ADD VALUE 'WON';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'quotes_status_enum') AND enumlabel = 'LOST') THEN
      ALTER TYPE quotes_status_enum ADD VALUE 'LOST';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'quotes_status_enum') AND enumlabel = 'EXPIRED') THEN
      ALTER TYPE quotes_status_enum ADD VALUE 'EXPIRED';
    END IF;
  END IF;
END $$;

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
