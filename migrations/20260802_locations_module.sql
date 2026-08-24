-- Agrega ubicaciones/depositos para identificar donde esta cada vehiculo.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type
    WHERE typname = 'locations_type_enum'
  ) THEN
    CREATE TYPE locations_type_enum AS ENUM (
      'DEPOSIT',
      'SHOWROOM',
      'WORKSHOP',
      'OTHER'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS locations (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL UNIQUE,
  type locations_type_enum NOT NULL DEFAULT 'DEPOSIT',
  address TEXT NULL,
  description TEXT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE vehicles
  ADD COLUMN IF NOT EXISTS location_id INTEGER NULL;

CREATE INDEX IF NOT EXISTS idx_vehicles_location_id
  ON vehicles(location_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_vehicles_location_id'
  ) THEN
    ALTER TABLE vehicles
      ADD CONSTRAINT fk_vehicles_location_id
      FOREIGN KEY (location_id)
      REFERENCES locations(id)
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS vehicle_location_movements (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER NOT NULL,
  from_location_id INTEGER NULL,
  to_location_id INTEGER NULL,
  reason TEXT NOT NULL,
  user_id INTEGER NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vehicle_location_movements_vehicle_id
  ON vehicle_location_movements(vehicle_id);

CREATE INDEX IF NOT EXISTS idx_vehicle_location_movements_created_at
  ON vehicle_location_movements(created_at);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_vehicle_location_movements_vehicle_id'
  ) THEN
    ALTER TABLE vehicle_location_movements
      ADD CONSTRAINT fk_vehicle_location_movements_vehicle_id
      FOREIGN KEY (vehicle_id)
      REFERENCES vehicles(id)
      ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_vehicle_location_movements_from_location_id'
  ) THEN
    ALTER TABLE vehicle_location_movements
      ADD CONSTRAINT fk_vehicle_location_movements_from_location_id
      FOREIGN KEY (from_location_id)
      REFERENCES locations(id)
      ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_vehicle_location_movements_to_location_id'
  ) THEN
    ALTER TABLE vehicle_location_movements
      ADD CONSTRAINT fk_vehicle_location_movements_to_location_id
      FOREIGN KEY (to_location_id)
      REFERENCES locations(id)
      ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_vehicle_location_movements_user_id'
  ) THEN
    ALTER TABLE vehicle_location_movements
      ADD CONSTRAINT fk_vehicle_location_movements_user_id
      FOREIGN KEY (user_id)
      REFERENCES users(id)
      ON DELETE SET NULL;
  END IF;
END $$;
