ALTER TABLE pre_sale_mechanical ADD COLUMN IF NOT EXISTS process_costs TEXT NULL;
ALTER TABLE pre_sale_bodywork ADD COLUMN IF NOT EXISTS process_costs TEXT NULL;
ALTER TABLE pre_sale_aesthetic ADD COLUMN IF NOT EXISTS process_costs TEXT NULL;
ALTER TABLE pre_sale_documentation ADD COLUMN IF NOT EXISTS process_costs TEXT NULL;
