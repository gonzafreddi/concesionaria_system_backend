# 📁 Estructura de Archivos - Sales Module

## CREADOS (2 archivos)

```
src/sales/entities/
└─ trade-in.entity.ts                    ✨ NEW
     TradeIn: ManyToOne(Sale, Vehicle)
     Campo: tradeInValue

src/sales/dto/
└─ create-trade-in.dto.ts                ✨ NEW
     DTO para agregar vehículos como parte de pago
```

---

## MODIFICADOS (6 archivos)

### 1. src/sales/entities/sale.entity.ts
**Cambios:**
- ✅ Agregado: `type: SaleType` (SALE | PURCHASE)
- ✅ Agregado: `status: SaleStatus` (DRAFT | RESERVED | SOLD | DELIVERED)
- ✅ Renombrado: `totalAmount` → `basePrice`
- ✅ Agregado: `finalPrice` (calculado automáticamente)
- ✅ Agregado: `totalPaid` (suma de pagos CONFIRMED)
- ✅ Agregado: `tradeIns: OneToMany(TradeIn)`
- ✅ Agregado: `createdAt`, `updatedAt` timestamps

**Compatibilidad:** ⚠️ Migración requerida
```sql
ALTER TABLE sales ADD COLUMN type ENUM('SALE', 'PURCHASE') DEFAULT 'SALE';
ALTER TABLE sales ADD COLUMN status ENUM('DRAFT', 'RESERVED', 'SOLD', 'DELIVERED') DEFAULT 'DRAFT';
ALTER TABLE sales RENAME COLUMN total_amount TO base_price;
ALTER TABLE sales ADD COLUMN final_price DECIMAL(10,2);
ALTER TABLE sales ADD COLUMN total_paid DECIMAL(10,2) DEFAULT 0;
ALTER TABLE sales ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE sales ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
```

---

### 2. src/sales/dto/create-sale.dto.ts
**Cambios:**
- ✅ Renombrado: `totalAmount` → `basePrice`
- ✅ Agregado: `type: SaleType` (enum)
- ✅ Añadidas validaciones: @IsEnum, @Min

**Uso:**
```typescript
{
  "clientId": 1,
  "vehicleId": 5,
  "userId": 2,
  "type": "SALE",          // Nuevo
  "basePrice": 250000,     // Cambio de nombre
  "saleDate": "2026-02-11T10:00:00Z"
}
```

---

### 3. src/sales/dto/update-sale.dto.ts
**Cambios:**
- ✅ Reescrito (era PartialType)
- ✅ Solo permite: `basePrice`, `saleDate`
- ✅ **NO permite cambiar `status`**
- ✅ Validación: basePrice solo si DRAFT

**Restricción importante:**
```typescript
// ANTES (permitía cualquier cosa):
export class UpdateSaleDto extends PartialType(CreateSaleDto) {}

// AHORA (restringido):
export class UpdateSaleDto {
  basePrice?: number;  // Solo si status === DRAFT
  saleDate?: string;
  // status NO está disponible
}
```

---

### 4. src/payments/entities/payment.entity.ts
**Cambios:**
- ✅ Agregado: `PaymentMethod` enum
- ✅ Renombrado: `status: PAID` → `PaymentStatus: CONFIRMED | REJECTED`
- ✅ Agregado: `method: PaymentMethod` enum (no string)
- ✅ Agregado: `notes: string` (información adicional)
- ✅ Agregado: `createdAt`, `updatedAt` timestamps

**Enums:**
```typescript
enum PaymentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED'
}

enum PaymentMethod {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  FINANCING = 'FINANCING',
  CHECK = 'CHECK'
}
```

**Compatibilidad:** ⚠️ Migración requerida
```sql
ALTER TABLE payments MODIFY COLUMN status ENUM('PENDING', 'CONFIRMED', 'REJECTED') DEFAULT 'PENDING';
ALTER TABLE payments MODIFY COLUMN method ENUM('CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'FINANCING', 'CHECK');
ALTER TABLE payments ADD COLUMN notes TEXT NULL;
ALTER TABLE payments ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE payments ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
```

---

### 5. src/payments/dto/create-payment.dto.ts
**Cambios:**
- ✅ Completamente implementado (estaba vacío)
- ✅ Agregado: saleId, amount, method, notes
- ✅ Validaciones: @IsEnum, @IsNumber, @Min

**Uso:**
```typescript
{
  "saleId": 10,
  "amount": 100000,
  "method": "BANK_TRANSFER",
  "notes": "Transferencia bancaria ref: 123456"
}
```

---

### 6. src/payments/dto/update-payment.dto.ts
**Cambios:**
- ✅ Reescrito (era PartialType)
- ✅ Solo permite cambiar: `status`
- ✅ El monto NO se puede cambiar

**Uso:**
```typescript
{
  "status": "CONFIRMED"  // o "REJECTED"
}
```

---

### 7. src/sales/sales.service.ts
**Reescrito completamente - Métodos agregados:**

| Método | Descripción |
|--------|-------------|
| `create()` | Crea Sale en DRAFT |
| `findAll()` | Lista operaciones |
| `findOne()` | Obtiene detalle |
| `update()` | Actualiza basePrice/saleDate |
| `remove()` | Elimina solo si DRAFT |
| **`addPayment()`** | ✨ Registra pago (transacción) |
| **`addTradeIn()`** | ✨ Agrega vehículo como parte de pago (transacción) |
| **`confirmPayment()`** | ✨ Valida pago PENDING→CONFIRMED/REJECTED (transacción) |
| **`deliverSale()`** | ✨ Entrega operación y actualiza stock (transacción) |
| **`reserve()`** | ✨ DRAFT→RESERVED y bloquea vehículo (transacción) |

**Métodos privados de cálculo:**
- `calculateSaleStatus()` - Determina estado según pagos/trade-ins
- `calculateStatusFromPayments()` - Recalcula estado desde pagos existentes

---

### 8. src/sales/sales.module.ts
**Cambios:**
- ✅ Agregado: `TradeIn` en imports
- ✅ Ahora importa: Sale, **TradeIn**, Quote, Client, Vehicle, User, Payment

**Antes:**
```typescript
TypeOrmModule.forFeature([Sale, Quote, Client, Vehicle, User, Payment])

// Después:
TypeOrmModule.forFeature([Sale, TradeIn, Quote, Client, Vehicle, User, Payment])
```

---

## 🔄 Métodos con Transacción

Estos métodos usan `DataSource.createQueryRunner()` para garantizar atomicidad:

```typescript
✓ addPayment()        - Lock en sale, validación, pago creado
✓ addTradeIn()        - Lock en sale, validación de vehículo
✓ confirmPayment()    - Lock en sale, actualiza totalPaid
✓ deliverSale()       - Lock en sale y vehicle, actualiza stock
✓ reserve()           - Lock en sale y vehicle
```

Cada transacción:
1. Inicia con `queryRunner.startTransaction()`
2. Lee datos con `queryRunner.manager.findOne()`
3. Valida según reglas de negocio
4. Si error → `rollbackTransaction()`
5. Si éxito → `commitTransaction()`

---

## 📊 Resumen de Cambios

| Categoría | Creados | Modificados | Total |
|-----------|---------|-------------|-------|
| Entidades | 1 | 1 | 2 |
| DTOs | 1 | 4 | 5 |
| Service | 0 | 1 | 1 |
| Module | 0 | 1 | 1 |
| **TOTAL** | **2** | **7** | **9** |

---

## ✅ Validaciones Implementadas

### En CREATE
- ✓ Cliente debe existir
- ✓ Vehículo debe existir
- ✓ Usuario debe existir
- ✓ Quote es opcional

### En UPDATE
- ✗ No permite cambiar status
- ✗ Solo basePrice si DRAFT
- ✓ Restringido a cambios seguros

### En ADD PAYMENT
- ✗ No si status === DELIVERED
- ✗ amount <= 0
- ✗ totalPaid + amount > finalPrice
- ✓ Transacción garantizada

### En ADD TRADE-IN
- ✗ No si status === DELIVERED
- ✗ Vehicle no en otra SALE activa
- ✗ tradeInValue > finalPrice
- ✓ Transacción garantizada

### En DELIVER
- ✗ totalPaid < finalPrice
- ✓ Actualiza Vehicle.status correcto
- ✓ Transacción con lock

### En RESERVE
- ✗ Solo si status === DRAFT
- ✓ Bloquea vehículo (Vehicle.status = RESERVED)

---

## 🎯 Logros Clave

✅ **Flujo unificado**: SALE y PURCHASE en una sola entidad/service
✅ **Sin duplicación**: Vehículos en TradeIn son referencias, no copias
✅ **Estado automático**: Transiciones calculadas, no manuales
✅ **Transacciones**: Atomicidad garantizada en operaciones críticas
✅ **Validaciones**: Reglas de negocio forzadas en service
✅ **No booleanos**: PaymentStatus enum en lugar de isPaid
✅ **Frontend protegido**: No puede forzar cambios de estado
✅ **Documentado**: Comments explicando cada decisión

