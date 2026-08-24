-- Agrega configuracion singleton de agencia/concesionaria para boletos y documentacion.

CREATE TABLE IF NOT EXISTS agency_settings (
  id SERIAL PRIMARY KEY,
  legal_name VARCHAR(180) NULL,
  trade_name VARCHAR(180) NULL,
  tax_id VARCHAR(30) NULL,
  address TEXT NULL,
  city VARCHAR(120) NULL,
  province VARCHAR(120) NULL,
  phone VARCHAR(60) NULL,
  email VARCHAR(180) NULL,
  representative_name VARCHAR(180) NULL,
  representative_document VARCHAR(30) NULL,
  logo_url TEXT NULL,
  tax_condition VARCHAR(120) NULL,
  postal_code VARCHAR(20) NULL,
  website TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO agency_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;
