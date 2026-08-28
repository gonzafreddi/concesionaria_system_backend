-- Permite registrar unidades que ya son stock propio, sin una compra,
-- consignación, toma ni vínculo con el dueño anterior.
DO $$
DECLARE
  entry_type_enum regtype;
BEGIN
  SELECT attribute.atttypid::regtype
  INTO entry_type_enum
  FROM pg_attribute AS attribute
  JOIN pg_class AS relation ON relation.oid = attribute.attrelid
  WHERE relation.relname = 'vehicles'
    AND attribute.attname = 'entry_type'
    AND attribute.attnum > 0
    AND NOT attribute.attisdropped;

  IF entry_type_enum IS NOT NULL THEN
    EXECUTE format(
      'ALTER TYPE %s ADD VALUE IF NOT EXISTS %L',
      entry_type_enum,
      'MANUAL_ENTRY'
    );
  END IF;
END $$;
