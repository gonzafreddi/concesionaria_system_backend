ALTER TABLE vehicles
ADD COLUMN entry_type ENUM('DIRECT_PURCHASE', 'CONSIGNMENT', 'TRADE_IN')
NOT NULL DEFAULT 'DIRECT_PURCHASE';

ALTER TABLE vehicles
ADD COLUMN owner_client_id INT NULL;

ALTER TABLE vehicles
ADD CONSTRAINT fk_vehicles_owner_client
FOREIGN KEY (owner_client_id) REFERENCES clients(id)
ON DELETE SET NULL;

CREATE TABLE consignments (
  id SERIAL PRIMARY KEY,
  vehicle_id INT NOT NULL,
  owner_client_id INT NOT NULL,
  take_price DECIMAL(12, 2) NOT NULL,
  estimated_sale_price DECIMAL(12, 2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_consignments_vehicle
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE RESTRICT,
  CONSTRAINT fk_consignments_owner_client
    FOREIGN KEY (owner_client_id) REFERENCES clients(id) ON DELETE RESTRICT
);
