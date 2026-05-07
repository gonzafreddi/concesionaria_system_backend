-- Migracion manual para soportar imagenes de vehiculos almacenadas en Cloudinary.
-- Crea la tabla vehicle_images y sus indices sin afectar datos existentes.

BEGIN;

CREATE TABLE IF NOT EXISTS vehicle_images (
  id SERIAL PRIMARY KEY,
  url VARCHAR(500) NOT NULL,
  public_id VARCHAR(255) NOT NULL UNIQUE,
  is_cover BOOLEAN NOT NULL DEFAULT FALSE,
  "order" INTEGER NOT NULL,
  vehicle_id INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vehicle_images_vehicle_id
  ON vehicle_images (vehicle_id);

CREATE INDEX IF NOT EXISTS idx_vehicle_images_vehicle_id_order
  ON vehicle_images (vehicle_id, "order");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_vehicle_images_vehicle_id'
  ) THEN
    ALTER TABLE vehicle_images
      ADD CONSTRAINT fk_vehicle_images_vehicle_id
      FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
      ON DELETE CASCADE;
  END IF;
END $$;

COMMIT;
