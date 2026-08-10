DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'service_order_status_enum') THEN
    CREATE TYPE service_order_status_enum AS ENUM ('OPEN', 'IN_PROGRESS', 'WAITING_PARTS', 'READY', 'DELIVERED', 'CANCELLED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'service_order_priority_enum') THEN
    CREATE TYPE service_order_priority_enum AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS service_orders (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
  title VARCHAR NOT NULL,
  description TEXT NOT NULL,
  diagnosis TEXT NULL,
  status service_order_status_enum NOT NULL DEFAULT 'OPEN',
  priority service_order_priority_enum NOT NULL DEFAULT 'NORMAL',
  assigned_user_id INTEGER NULL REFERENCES users(id) ON DELETE SET NULL,
  estimated_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
  actual_cost NUMERIC(12,2) NULL,
  entry_date TIMESTAMP NOT NULL DEFAULT NOW(),
  estimated_delivery_date TIMESTAMP NULL,
  delivered_at TIMESTAMP NULL,
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_orders_status ON service_orders(status);
CREATE INDEX IF NOT EXISTS idx_service_orders_client_id ON service_orders(client_id);
CREATE INDEX IF NOT EXISTS idx_service_orders_vehicle_id ON service_orders(vehicle_id);
