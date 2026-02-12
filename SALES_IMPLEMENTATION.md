# Sales Module - Implementación Completa

## 📋 Resumen de Cambios

### Archivos Creados
1. **src/sales/entities/trade-in.entity.ts** - Nueva entidad para vehículos dados como parte de pago
2. **src/sales/dto/create-trade-in.dto.ts** - DTO para crear trade-ins

### Archivos Modificados
1. **src/sales/entities/sale.entity.ts** - Extendida con enums y relaciones
2. **src/sales/dto/create-sale.dto.ts** - Actualizado con campos nuevos
3. **src/sales/dto/update-sale.dto.ts** - Restringido para evitar cambios de estado desde frontend
4. **src/payments/entities/payment.entity.ts** - Mejorado con enums y campos adicionales
5. **src/payments/dto/create-payment.dto.ts** - Implementado completamente
6. **src/payments/dto/update-payment.dto.ts** - Implementado para actualizar status
7. **src/sales/sales.service.ts** - Reescrito con lógica completa
8. **src/sales/sales.module.ts** - Actualizado con nuevas entidades

---

## 🏗️ Arquitectura

### Flujo Unificado SALE/PURCHASE

```
SALE (Venta):
  Client compra Vehicle
  ├─ Stock: AVAILABLE → RESERVED → SOLD
  └─ Concesionaria pierde inventario

PURCHASE (Compra):
  Concesionaria compra Vehicle a Client
  ├─ Stock: [nuevo vehículo]
  └─ Concesionaria gana inventario
```

### Transiciones de Estado

```
DRAFT (inicial, sin confirmar)
  ↓
RESERVED (primer pago o trade-in)
  ↓
SOLD (100% pagado)
  ↓
DELIVERED (entregado, stock actualizado)
```

---

## 📦 Entidades

### Sale Entity

```typescript
type: SALE | PURCHASE                 // Tipo de operación
status: DRAFT | RESERVED | SOLD | DELIVERED  // Estado actual
basePrice: decimal                    // Precio inicial sin descuentos
finalPrice: decimal                   // Precio calculado (base - trade-ins)
totalPaid: decimal                    // Suma de pagos CONFIRMED
saleDate: timestamp                   // Fecha de operación

relationships:
  ├─ client: ManyToOne(Client)
  ├─ vehicle: ManyToOne(Vehicle)
  ├─ user: ManyToOne(User)
  ├─ quote: ManyToOne(Quote, nullable)
  ├─ payments: OneToMany(Payment)     // Todos los pagos
  └─ tradeIns: OneToMany(TradeIn)     // Vehículos como parte de pago
```

### Payment Entity

```typescript
status: PENDING | CONFIRMED | REJECTED
  ├─ PENDING: Registrado pero no validado
  ├─ CONFIRMED: Pago recibido/validado (suma en totalPaid)
  └─ REJECTED: Pago rechazado

method: CASH | CREDIT_CARD | DEBIT_CARD | BANK_TRANSFER | FINANCING | CHECK

amount: decimal                       // Monto
paidAt: timestamp (nullable)          // Cuándo se confirmó
notes: text (nullable)                // Información adicional

relationship:
  └─ sale: ManyToOne(Sale)
```

### TradeIn Entity

```typescript
tradeInValue: decimal                 // Valuación del vehículo aportado
createdAt: timestamp

relationships:
  ├─ sale: ManyToOne(Sale)
  └─ vehicle: ManyToOne(Vehicle)     // No se duplica, referencia existente
```

---

## 🔧 Métodos SalesService

### CREATE (Operación nueva)
```typescript
create(createSaleDto: CreateSaleDto)
```
- Inicia en estado DRAFT
- finalPrice = basePrice
- totalPaid = 0
- No modifica stock del vehículo aún

### ADD PAYMENT (Registrar pago)
```typescript
addPayment(createPaymentDto: CreatePaymentDto)
```
- Valida: Monto > 0, totalPaid + amount <= finalPrice
- Crea Payment con status PENDING
- Transacción: Solo ejecuta si todas las validaciones pasan
- Retorna: { payment, sale (actualizado) }

**Automático:**
- DRAFT → RESERVED: Si hay pagos confirmados O trade-in
- RESERVED → SOLD: Si totalPaid >= finalPrice

### ADD TRADE-IN (Vehículo como parte de pago)
```typescript
addTradeIn(createTradeInDto: CreateTradeInDto)
```
- Valida: Vehicle no en otra SALE activa
- Valida: tradeInValue <= finalPrice
- Descuenta del finalPrice
- Marca RESERVED automáticamente
- Transacción garantizada

### CONFIRM PAYMENT (Validar pago)
```typescript
confirmPayment(paymentId: number, status: PaymentStatus)
```
- PENDING → CONFIRMED: Aumenta totalPaid
- PENDING → REJECTED: No suma
- CONFIRMED → REJECTED: Resta totalPaid
- Recalcula estado automáticamente

### DELIVER SALE (Entregar operación)
```typescript
deliverSale(id: number)
```
- Precondición: totalPaid >= finalPrice (100% pagado)
- Actualiza Vehicle.status según tipo:
  - SALE: Vehicle.status = SOLD
  - PURCHASE: Vehicle.status = AVAILABLE
- Transacción: Lock en sale durante operación

### RESERVE (Cambio DRAFT → RESERVED)
```typescript
reserve(id: number)
```
- Precondición: status === DRAFT
- Solo para SALE: actualiza Vehicle.status = RESERVED
- Impedirá que otros clientes compren mismo vehículo

---

## 🔐 Validaciones

### En CREATE
- Cliente, Vehículo, Usuario deben existir
- Quote es opcional

### En ADD PAYMENT
- ✗ Sale en DELIVERED: No se permiten pagos
- ✗ amount <= 0: Error
- ✗ totalPaid + amount > finalPrice: Over-pay error
- ✓ Se usa transacción para garantizar consistencia

### En ADD TRADE-IN
- ✗ Sale en DELIVERED: No se agregan trade-ins
- ✗ Vehicle en otra SALE activa: Conflicto
- ✗ tradeInValue > finalPrice: Excede precio
- ✓ Transacción garantiza atomicidad

### En DELIVER SALE
- ✗ totalPaid < finalPrice: No 100% pagado
- ✓ Actualiza Vehicle.status correctamente
- ✓ Transacción con lock previene race conditions

### En UPDATE
- ✗ basePrice: Solo si status === DRAFT
- ✗ Status: NO se puede cambiar desde DTO
- ✓ Status se actualiza automáticamente en métodos específicos

---

## 📊 Cálculo de Estado

El estado se recalcula automáticamente según:

```typescript
// Prioridad de cálculo:
1. Si DELIVERED → permanece DELIVERED
2. Si hay trade-ins → RESERVED
3. Si totalPaid >= finalPrice → SOLD
4. Si totalPaid > 0 → RESERVED
5. Default → DRAFT
```

**No requiere intervención del frontend.**

---

## 💾 Transacciones

Se usa `DataSource.createQueryRunner()` para:
1. **Atomicidad**: Todas las operaciones suceden o ninguna
2. **Lock**: Previene race conditions
3. **Rollback**: Si hay error, revierte todo

Métodos con transacción:
- ✓ addPayment()
- ✓ addTradeIn()
- ✓ confirmPayment()
- ✓ deliverSale()
- ✓ reserve()

---

## 🚀 Uso (Ejemplos)

### 1. Crear SALE (venta)
```typescript
POST /sales
{
  "clientId": 1,
  "vehicleId": 5,
  "userId": 2,
  "type": "SALE",
  "basePrice": 250000,
  "saleDate": "2026-02-11T10:00:00Z"
}
// Response: Sale { id: 10, status: DRAFT, finalPrice: 250000, ... }
```

### 2. Registrar pago
```typescript
POST /sales/:id/payments
{
  "saleId": 10,
  "amount": 100000,
  "method": "BANK_TRANSFER"
}
// Response: {
//   payment: { id: 1, status: PENDING, amount: 100000 },
//   sale: { status: RESERVED, totalPaid: 0, ... }  ← No suma aún (PENDING)
// }
```

### 3. Confirmar pago
```typescript
PATCH /payments/:id
{
  "status": "CONFIRMED"
}
// Response: {
//   payment: { status: CONFIRMED, paidAt: "2026-02-11T10:05:00Z" },
//   sale: { status: RESERVED, totalPaid: 100000, ... }  ← Suma aquí
// }
```

### 4. Agregar trade-in
```typescript
POST /sales/:id/trade-ins
{
  "saleId": 10,
  "vehicleId": 3,  ← Vehículo que aporta cliente
  "tradeInValue": 50000
}
// Response: {
//   tradeIn: { id: 1, vehicle: { id: 3 }, tradeInValue: 50000 },
//   sale: { status: RESERVED, finalPrice: 200000 }  ← Descuento aplicado
// }
```

### 5. Entregar (con 100% pagado)
```typescript
POST /sales/:id/deliver
// Precondición: totalPaid >= finalPrice

// Response: Sale {
//   status: DELIVERED,
//   vehicle: { status: SOLD }  ← Stock actualizado
// }
```

---

## 🔄 Flujo Completo: SALE

```
1. create()
   status: DRAFT, finalPrice: 250000, totalPaid: 0
   vehicle.status: AVAILABLE (sin cambios)

2. reserve()  (opcional, para bloquear vehículo)
   status: RESERVED
   vehicle.status: RESERVED

3. addPayment(100000)
   payment.status: PENDING
   sale.status: RESERVED (sin cambios)
   totalPaid: 0 (aún no confirmado)

4. confirmPayment() → CONFIRMED
   totalPaid: 100000
   status: RESERVED (falta más pago)

5. addPayment(100000)
   payment.status: PENDING

6. confirmPayment() → CONFIRMED
   totalPaid: 200000
   status: RESERVED

7. addTradeIn(50000)
   finalPrice: 200000 (250000 - 50000)
   status: RESERVED

8. addPayment(50000)
   payment.status: PENDING

9. confirmPayment() → CONFIRMED
   totalPaid: 250000 = finalPrice
   status: SOLD (100% pagado)

10. deliverSale()
    status: DELIVERED
    vehicle.status: SOLD
    ✓ Operación completada
```

---

## 🔄 Flujo Completo: PURCHASE

```
1. create()
   type: PURCHASE
   status: DRAFT, basePrice: 150000
   (No afecta vehículo aún)

2. addPayment(150000)
   payment.status: PENDING
   status: RESERVED

3. confirmPayment() → CONFIRMED
   totalPaid: 150000 = finalPrice
   status: SOLD (100% pagado)

4. deliverSale()
   status: DELIVERED
   vehicle.status: AVAILABLE  ← Nuevo en inventario
   ✓ Vehículo ahora está en stock
```

---

## ⚠️ Restricciones Implementadas

| Operación | DRAFT | RESERVED | SOLD | DELIVERED |
|-----------|-------|----------|------|-----------|
| update (basePrice) | ✓ | ✗ | ✗ | ✗ |
| addPayment | ✓ | ✓ | ✓ | ✗ |
| addTradeIn | ✓ | ✓ | ✓ | ✗ |
| reserve | ✓ | ✗ | ✗ | ✗ |
| deliver | ✗ | ✗ | ✓* | ✗ |
| remove | ✓ | ✗ | ✗ | ✗ |

*solo si 100% pagado

---

## 📄 DTOs Disponibles

### CreateSaleDto
```typescript
quoteId?: number
clientId: number
vehicleId: number
userId: number
type: SaleType      // SALE | PURCHASE
basePrice: number
saleDate: string    // ISO date
```

### UpdateSaleDto
```typescript
basePrice?: number  // Solo si DRAFT
saleDate?: string
```

### CreatePaymentDto
```typescript
saleId: number
amount: number      // > 0
method: PaymentMethod
notes?: string
```

### UpdatePaymentDto
```typescript
status?: PaymentStatus  // CONFIRMED | REJECTED
```

### CreateTradeInDto
```typescript
saleId: number
vehicleId: number
tradeInValue: number
```

---

## 🔗 Relaciones sin Duplicación

**Vehicle NO se duplica en TradeIn:**
```typescript
// TradeIn solo referencia el vehículo existente
@ManyToOne(() => Vehicle)
vehicle: Vehicle;  // ← Apunta a Vehicle existente

// Si el vehículo no existe:
if (!vehicle) throw new NotFoundException(...)

// Si ya está en otra SALE activa:
const existing = await tradeInRepository.findOne({
  where: { vehicle: { id: vehicleId } },
  relations: ['sale']
});
if (existing && existing.sale.id !== saleId && ...)
  throw new BadRequestException(...)
```

---

## 🛡️ Reutilización del Flujo

**El mismo código maneja SALE y PURCHASE:**

```typescript
// En addPayment()
async addPayment(dto: CreatePaymentDto) {
  // Lógica igual para SALE y PURCHASE
  // Diferencia está SOLO en deliverSale():
  
  if (sale.type === SaleType.SALE) {
    vehicle.status = VehicleStatus.SOLD;  // Venta: pierde vehículo
  } else if (sale.type === SaleType.PURCHASE) {
    vehicle.status = VehicleStatus.AVAILABLE;  // Compra: gana vehículo
  }
}
```

---

## 📋 Checklist de Implementación

- [x] Sale entity con type y status
- [x] Payment entity mejorada (sin booleanos isPaid)
- [x] TradeIn entity (sin duplicación)
- [x] DTOs con validaciones
- [x] addPayment() con transacción
- [x] addTradeIn() con validaciones
- [x] confirmPayment() con recálculo de estado
- [x] deliverSale() con actualización de stock
- [x] reserve() para bloquear vehículo
- [x] Validación: Vehicle no en dos SALE activas
- [x] Validación: No pagos en DELIVERED
- [x] Validación: No sobre-pagar
- [x] Documentación de flujo (comments)
- [x] Lógica SOLO en service (no en controller)
- [x] Transacciones garantizadas
- [x] Estado calculado automáticamente (no manual)

---

## 🔧 Próximos Pasos (Opcional)

1. **SalesController**: Agregar endpoints para addPayment, addTradeIn, confirmPayment, deliver, reserve
2. **PaymentsModule**: Crear service/controller si aún no existe
3. **Tests**: Implementar tests unitarios para cada método
4. **Migrations**: Crear migrations de Typeorm para nuevas columnas/entidades
5. **Auditoría**: Agregar audit logging para cambios de estado

---

## ❓ FAQ

**P: ¿Puedo cambiar status directamente desde el DTO?**
R: No. UpdateSaleDto no tiene campo status. Se actualiza automáticamente en métodos específicos.

**P: ¿Qué pasa si cancelo un pago confirmado?**
R: confirmPayment(id, REJECTED) revierte el totalPaid y recalcula estado.

**P: ¿Puede un vehículo estar en dos trade-ins?**
R: No. Se valida que solo esté en UNA SALE activa.

**P: ¿SALE y PURCHASE comparten la misma tabla?**
R: Sí. Column `type` diferencia la operación. Flujo idéntico, solo diferencia en actualizacion del stock.

**P: ¿Es necesario confirmar pagos manualmente?**
R: Sí. PENDING → CONFIRMED requiere validación explícita.

**P: ¿Puedo sobre-pagar?**
R: No. Validación: totalPaid + amount <= finalPrice

