# 🗄️ Migraciones de Base de Datos - Sales Module

## Instrucciones

Ejecutar las siguientes migraciones en orden:

---

## Migration 1: Actualizar tabla `sales`

**Archivo:** `src/database/migrations/[timestamp]-UpdateSalesTable.ts`

```typescript
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UpdateSalesTable1234567890123 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Agregar columnas nuevas
    await queryRunner.addColumn(
      'sales',
      new TableColumn({
        name: 'type',
        type: 'enum',
        enum: ['SALE', 'PURCHASE'],
        default: "'SALE'",
        isNullable: false,
      }),
    );

    await queryRunner.addColumn(
      'sales',
      new TableColumn({
        name: 'status',
        type: 'enum',
        enum: ['DRAFT', 'RESERVED', 'SOLD', 'DELIVERED'],
        default: "'DRAFT'",
        isNullable: false,
      }),
    );

    // 2. Renombrar totalAmount a basePrice
    await queryRunner.renameColumn('sales', 'total_amount', 'base_price');

    // 3. Agregar finalPrice
    await queryRunner.addColumn(
      'sales',
      new TableColumn({
        name: 'final_price',
        type: 'decimal',
        precision: 10,
        scale: 2,
        isNullable: false,
        default: 0,
      }),
    );

    // 4. Agregar totalPaid
    await queryRunner.addColumn(
      'sales',
      new TableColumn({
        name: 'total_paid',
        type: 'decimal',
        precision: 10,
        scale: 2,
        isNullable: false,
        default: 0,
      }),
    );

    // 5. Agregar timestamps
    await queryRunner.addColumn(
      'sales',
      new TableColumn({
        name: 'created_at',
        type: 'timestamp',
        default: 'CURRENT_TIMESTAMP',
        isNullable: false,
      }),
    );

    await queryRunner.addColumn(
      'sales',
      new TableColumn({
        name: 'updated_at',
        type: 'timestamp',
        default: 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
        isNullable: false,
      }),
    );

    // 6. Actualizar finalPrice = basePrice para registros existentes
    await queryRunner.query(
      'UPDATE sales SET final_price = base_price WHERE final_price = 0',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('sales', 'updated_at');
    await queryRunner.dropColumn('sales', 'created_at');
    await queryRunner.dropColumn('sales', 'total_paid');
    await queryRunner.dropColumn('sales', 'final_price');
    await queryRunner.renameColumn('sales', 'base_price', 'total_amount');
    await queryRunner.dropColumn('sales', 'status');
    await queryRunner.dropColumn('sales', 'type');
  }
}
```

### SQL directo (MySQL):
```sql
ALTER TABLE sales ADD COLUMN `type` ENUM('SALE', 'PURCHASE') DEFAULT 'SALE' AFTER id;
ALTER TABLE sales ADD COLUMN `status` ENUM('DRAFT', 'RESERVED', 'SOLD', 'DELIVERED') DEFAULT 'DRAFT' AFTER `type`;
ALTER TABLE sales RENAME COLUMN total_amount TO base_price;
ALTER TABLE sales ADD COLUMN final_price DECIMAL(10,2) DEFAULT 0 AFTER base_price;
ALTER TABLE sales ADD COLUMN total_paid DECIMAL(10,2) DEFAULT 0 AFTER final_price;
ALTER TABLE sales ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE sales ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
UPDATE sales SET final_price = base_price WHERE final_price = 0;
```

---

## Migration 2: Actualizar tabla `payments`

**Archivo:** `src/database/migrations/[timestamp]-UpdatePaymentsTable.ts`

```typescript
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UpdatePaymentsTable1234567890124 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Cambiar status enum (PAID → CONFIRMED | REJECTED)
    await queryRunner.changeColumn(
      'payments',
      'status',
      new TableColumn({
        name: 'status',
        type: 'enum',
        enum: ['PENDING', 'CONFIRMED', 'REJECTED'],
        default: "'PENDING'",
        isNullable: false,
      }),
    );

    // 2. Convertir method a ENUM
    await queryRunner.changeColumn(
      'payments',
      'method',
      new TableColumn({
        name: 'method',
        type: 'enum',
        enum: [
          'CASH',
          'CREDIT_CARD',
          'DEBIT_CARD',
          'BANK_TRANSFER',
          'FINANCING',
          'CHECK',
        ],
        isNullable: false,
      }),
    );

    // 3. Agregar notes
    await queryRunner.addColumn(
      'payments',
      new TableColumn({
        name: 'notes',
        type: 'text',
        isNullable: true,
      }),
    );

    // 4. Agregar timestamps
    await queryRunner.addColumn(
      'payments',
      new TableColumn({
        name: 'created_at',
        type: 'timestamp',
        default: 'CURRENT_TIMESTAMP',
        isNullable: false,
      }),
    );

    await queryRunner.addColumn(
      'payments',
      new TableColumn({
        name: 'updated_at',
        type: 'timestamp',
        default: 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
        isNullable: false,
      }),
    );

    // 5. Migrar valores antiguos PAID → CONFIRMED
    await queryRunner.query(
      "UPDATE payments SET status = 'CONFIRMED' WHERE status = 'PAID'",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('payments', 'updated_at');
    await queryRunner.dropColumn('payments', 'created_at');
    await queryRunner.dropColumn('payments', 'notes');
    // Revertir enums...
  }
}
```

### SQL directo (MySQL):
```sql
-- Migrar datos antiguos antes de cambiar tipo
UPDATE payments SET status = 'CONFIRMED' WHERE status = 'PAID';

-- Cambiar enum
ALTER TABLE payments MODIFY COLUMN `status` ENUM('PENDING', 'CONFIRMED', 'REJECTED') DEFAULT 'PENDING';

-- Cambiar method a enum (asumiendo valores convertibles)
-- Si hay valores no válidos, actualizar primero:
UPDATE payments SET method = 'CASH' WHERE method NOT IN ('CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'FINANCING', 'CHECK');
ALTER TABLE payments MODIFY COLUMN `method` ENUM('CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'FINANCING', 'CHECK');

-- Agregar columnas nuevas
ALTER TABLE payments ADD COLUMN notes TEXT NULL;
ALTER TABLE payments ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE payments ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
```

---

## Migration 3: Crear tabla `trade_ins`

**Archivo:** `src/database/migrations/[timestamp]-CreateTradeInsTable.ts`

```typescript
import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateTradeInsTable1234567890125 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'trade_ins',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'sale_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'vehicle_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'trade_in_value',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
        indices: [
          new TableIndex({ columnNames: ['sale_id'] }),
          new TableIndex({ columnNames: ['vehicle_id'] }),
          new TableIndex({ columnNames: ['sale_id', 'vehicle_id'], isUnique: false }),
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['sale_id'],
            referencedTableName: 'sales',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['vehicle_id'],
            referencedTableName: 'vehicles',
            referencedColumnNames: ['id'],
            onDelete: 'RESTRICT',
          }),
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('trade_ins');
  }
}
```

### SQL directo (MySQL):
```sql
CREATE TABLE trade_ins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sale_id INT NOT NULL,
  vehicle_id INT NOT NULL,
  trade_in_value DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE RESTRICT,
  
  INDEX idx_sale_id (sale_id),
  INDEX idx_vehicle_id (vehicle_id)
);
```

---

## Orden de Ejecución

1. **Backup** de base de datos
2. Ejecutar Migration 1 (sales)
3. Ejecutar Migration 2 (payments)
4. Ejecutar Migration 3 (trade_ins)
5. Verificar datos

---

## Verificación Post-Migración

```sql
-- Verificar estructura de sales
DESC sales;
-- Debería mostrar: type, status, base_price, final_price, total_paid, created_at, updated_at

-- Verificar estructura de payments
DESC payments;
-- Debería mostrar: status (ENUM), method (ENUM), notes, created_at, updated_at

-- Verificar nueva tabla
DESC trade_ins;
-- Debería mostrar: sale_id, vehicle_id, trade_in_value, created_at

-- Verificar datos migrados
SELECT COUNT(*) FROM sales WHERE type = 'SALE';
SELECT COUNT(*) FROM payments WHERE status = 'CONFIRMED';
```

---

## Rollback (si es necesario)

```bash
# TypeORM
npm run typeorm migration:revert

# O manualmente ejecutar DOWN de migraciones en orden inverso:
# 3. CreateTradeInsTable.down()
# 2. UpdatePaymentsTable.down()
# 1. UpdateSalesTable.down()
```

---

## ⚠️ Consideraciones

### Datos existentes
- `sale.totalAmount` → `sale.basePrice` (preserva valores)
- `sale.finalPrice` ← `basePrice` (copia inicial)
- `payment.status = PAID` → `CONFIRMED` (migración)
- `payment.method` : String → ENUM (asegurar valores válidos)

### Índices
- Agregados en `trade_ins` para performance en queries frecuentes
- FK en `sale_id` con CASCADE (trade-ins se eliminan con sale)
- FK en `vehicle_id` con RESTRICT (no permite eliminar vehículos en trade-ins activos)

### Transacciones
- Ejecutar migraciones dentro de transacción (TypeORM lo hace automáticamente)
- Si hay error, hacer rollback automático

---

## Testing Post-Migración

```sql
-- Insertar sale de prueba
INSERT INTO sales (type, status, base_price, final_price, total_paid, client_id, vehicle_id, user_id, sale_date, created_at, updated_at)
VALUES ('SALE', 'DRAFT', 100000, 100000, 0, 1, 1, 1, NOW(), NOW(), NOW());

-- Insertar pago de prueba
INSERT INTO payments (sale_id, amount, method, status, created_at, updated_at)
VALUES (1, 50000, 'CASH', 'PENDING', NOW(), NOW());

-- Insertar trade-in de prueba
INSERT INTO trade_ins (sale_id, vehicle_id, trade_in_value, created_at)
VALUES (1, 2, 25000, NOW());

-- Verificar relaciones
SELECT s.*, p.id as payment_id, t.id as trade_in_id
FROM sales s
LEFT JOIN payments p ON s.id = p.sale_id
LEFT JOIN trade_ins t ON s.id = t.sale_id
WHERE s.id = 1;
```

---

## Pipeline Completo

1. ✅ Ejecutar migrations
2. ✅ Verificar datos
3. ✅ Reiniciar servidor (npm start)
4. ✅ Testear endpoints (ver USAGE_EXAMPLES.md)
5. ✅ Monitorear logs para errores

