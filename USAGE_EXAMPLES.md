# 🚀 Guía de Uso Práctico - Sales Module

## Control Completo

Este documento muestra cómo usar la API en un flujo real.

---

## 📍 Endpoints (a implementar en SalesController)

```typescript
// Operaciones básicas (ya existen)
POST   /sales                    → create()
GET    /sales                    → findAll()
GET    /sales/:id                → findOne()
PATCH  /sales/:id                → update()
DELETE /sales/:id                → remove()

// Nuevos endpoints (agregar)
POST   /sales/:id/reserve        → reserve()
POST   /sales/:id/payments       → addPayment()
PATCH  /payments/:id             → confirmPayment()
POST   /sales/:id/trade-ins      → addTradeIn()
POST   /sales/:id/deliver        → deliverSale()
```

---

## 🎬 Ejemplo 1: Venta Completa (SALE)

### Paso 1: Crear operación
```bash
POST /sales
Content-Type: application/json

{
  "clientId": 1,
  "vehicleId": 5,
  "userId": 2,
  "type": "SALE",
  "basePrice": 250000,
  "saleDate": "2026-02-11T10:00:00Z"
}

✅ Response 201:
{
  "id": 10,
  "type": "SALE",
  "status": "DRAFT",
  "client": { "id": 1, "name": "Juan Pérez" },
  "vehicle": { "id": 5, "brand": "Toyota", "model": "Corolla", "status": "AVAILABLE" },
  "user": { "id": 2, "name": "Carlos Vendedor" },
  "basePrice": 250000,
  "finalPrice": 250000,
  "totalPaid": 0,
  "saleDate": "2026-02-11T10:00:00Z",
  "payments": [],
  "tradeIns": [],
  "createdAt": "2026-02-11T10:15:00Z",
  "updatedAt": "2026-02-11T10:15:00Z"
}
```

**Estado actual:** DRAFT
- ❌ No se pueden confirmar pagos
- ❌ No se puede entregar
- ✅ Se puede actualizar basePrice
- ✅ Se puede registrar pagos

---

### Paso 2: Bloquear vehículo (opcional pero recomendado)
```bash
POST /sales/10/reserve

✅ Response 200:
{
  "id": 10,
  "status": "RESERVED",
  "vehicle": { "id": 5, "status": "RESERVED" },
  "...": "..."
}
```

**Efecto:**
- Vehicle.status = RESERVED (otros no pueden venderlo)
- Sale.status = RESERVED

---

### Paso 3: Registrar primer pago
```bash
POST /sales/10/payments
Content-Type: application/json

{
  "saleId": 10,
  "amount": 100000,
  "method": "BANK_TRANSFER",
  "notes": "Primer cuota transferencia bancaria ref: TRF001"
}

✅ Response 201:
{
  "payment": {
    "id": 1,
    "sale": { "id": 10 },
    "amount": 100000,
    "method": "BANK_TRANSFER",
    "status": "PENDING",
    "paidAt": null,
    "notes": "Primer cuota transferencia bancaria ref: TRF001",
    "createdAt": "2026-02-11T10:20:00Z"
  },
  "sale": {
    "id": 10,
    "status": "RESERVED",
    "totalPaid": 0,       ← No suma aún (PENDING)
    "finalPrice": 250000
  }
}
```

**Estado:** PENDING (pendiente de validación)
- Sale.totalPaid NO aumentó (sigue 0)
- Estado de sale NO cambió

---

### Paso 4: Confirmar pago
```bash
PATCH /payments/1
Content-Type: application/json

{
  "status": "CONFIRMED"
}

✅ Response 200:
{
  "payment": {
    "id": 1,
    "status": "CONFIRMED",
    "paidAt": "2026-02-11T10:25:00Z",
    "amount": 100000
  },
  "sale": {
    "id": 10,
    "status": "RESERVED",
    "totalPaid": 100000,  ← Ahora suma
    "finalPrice": 250000,
    "balance": 150000
  }
}
```

**Efecto:**
- Payment.status = CONFIRMED
- Sale.totalPaid = 100000
- Sale.status sigue RESERVED (falta pago)

---

### Paso 5: Registrar segundo pago
```bash
POST /sales/10/payments

{
  "saleId": 10,
  "amount": 100000,
  "method": "CREDIT_CARD",
  "notes": "Tarjeta de crédito"
}

✅ Response 201:
{
  "payment": {
    "id": 2,
    "status": "PENDING",
    "amount": 100000
  },
  "sale": {
    "id": 10,
    "totalPaid": 100000  ← Sin cambios (PENDING)
  }
}
```

---

### Paso 6: Confirmar segundo pago
```bash
PATCH /payments/2

{
  "status": "CONFIRMED"
}

✅ Response 200:
{
  "payment": {
    "id": 2,
    "status": "CONFIRMED",
    "paidAt": "2026-02-11T10:30:00Z"
  },
  "sale": {
    "id": 10,
    "status": "RESERVED",
    "totalPaid": 200000,  ← 100000 + 100000
    "finalPrice": 250000,
    "balance": 50000
  }
}
```

---

### Paso 7: Agregar trade-in (vehículo del cliente)
```bash
POST /sales/10/trade-ins
Content-Type: application/json

{
  "saleId": 10,
  "vehicleId": 3,           ← Vehículo viejo del cliente
  "tradeInValue": 50000     ← Valuación
}

✅ Response 201:
{
  "tradeIn": {
    "id": 1,
    "sale": { "id": 10 },
    "vehicle": { "id": 3, "brand": "Honda", "model": "Civic" },
    "tradeInValue": 50000,
    "createdAt": "2026-02-11T10:35:00Z"
  },
  "sale": {
    "id": 10,
    "status": "RESERVED",
    "basePrice": 250000,
    "finalPrice": 200000,   ← 250000 - 50000
    "totalPaid": 200000,
    "balance": 0            ← 200000 - 200000
  }
}
```

**Efecto:**
- finalPrice = 250000 - 50000 = 200000
- totalPaid sigue 200000
- Ahora balance = 0 (100% pagado)
- Sale.status debería cambiar a SOLD (en próxima operación)

---

### Paso 8: Registrar último pago (costo restante tras trade-in)
```bash
POST /sales/10/payments

{
  "saleId": 10,
  "amount": 0,
  "method": "CASH",
  "notes": "Diferencia cubierta con trade-in"
}

⚠️ Response 400:
{
  "error": "BadRequestException",
  "message": "Monto debe ser mayor a 0"
}
```

**Alternativa:** No se necesita si totalPaid >= finalPrice

---

### Paso 9: Obtener detalles finales
```bash
GET /sales/10

✅ Response 200:
{
  "id": 10,
  "type": "SALE",
  "status": "SOLD",          ← Cambió automáticamente
  "basePrice": 250000,
  "finalPrice": 200000,
  "totalPaid": 200000,
  "balance": 0,
  "client": { "id": 1, "name": "Juan Pérez" },
  "vehicle": {
    "id": 5,
    "brand": "Toyota",
    "model": "Corolla",
    "status": "RESERVED"      ← Aún no SOLD (no entregado)
  },
  "payments": [
    { "id": 1, "amount": 100000, "status": "CONFIRMED" },
    { "id": 2, "amount": 100000, "status": "CONFIRMED" }
  ],
  "tradeIns": [
    { "id": 1, "vehicle": { "id": 3 }, "tradeInValue": 50000 }
  ]
}
```

---

### Paso 10: Entregar operación
```bash
POST /sales/10/deliver

✅ Response 200:
{
  "id": 10,
  "status": "DELIVERED",
  "vehicle": {
    "id": 5,
    "status": "SOLD"         ← Actualizado
  },
  "totalPaid": 200000,
  "finalPrice": 200000,
  "balance": 0
}
```

**Efecto:**
- Sale.status = DELIVERED (final)
- Vehicle.status = SOLD (fuera de inventario)
- ❌ No se pueden agregar más pagos
- ❌ No se pueden agregar trade-ins
- ✅ Operación completada

---

## 🎬 Ejemplo 2: Compra (PURCHASE)

### Paso 1: Crear operación de compra
```bash
POST /sales

{
  "clientId": 5,             ← Vendedor (no comprador)
  "vehicleId": 7,            ← Vehículo a comprar
  "userId": 3,
  "type": "PURCHASE",        ← Diferencia clave
  "basePrice": 150000,
  "saleDate": "2026-02-11T11:00:00Z"
}

✅ Response 201:
{
  "id": 11,
  "type": "PURCHASE",
  "status": "DRAFT",
  "basePrice": 150000,
  "finalPrice": 150000,
  "totalPaid": 0,
  "client": { "id": 5, "name": "Pedro Sánchez" },
  "vehicle": { "id": 7, "status": "AVAILABLE" }
}
```

**Diferencias con SALE:**
- type = PURCHASE
- Vehicle.status NO cambia a RESERVED en reserve()
- En deliver(): Vehicle.status = AVAILABLE (entra a inventario)

---

### Paso 2: Registrar pago
```bash
POST /sales/11/payments

{
  "saleId": 11,
  "amount": 150000,
  "method": "CASH",
  "notes": "Pago en efectivo"
}

✅ Response 201:
{
  "payment": {
    "id": 3,
    "status": "PENDING",
    "amount": 150000
  },
  "sale": {
    "id": 11,
    "status": "RESERVED",
    "totalPaid": 0
  }
}
```

---

### Paso 3: Confirmar pago
```bash
PATCH /payments/3

{
  "status": "CONFIRMED"
}

✅ Response 200:
{
  "payment": {
    "id": 3,
    "status": "CONFIRMED"
  },
  "sale": {
    "id": 11,
    "status": "SOLD",       ← 100% pagado
    "totalPaid": 150000,
    "finalPrice": 150000
  }
}
```

---

### Paso 4: Entregar
```bash
POST /sales/11/deliver

✅ Response 200:
{
  "id": 11,
  "status": "DELIVERED",
  "type": "PURCHASE",
  "vehicle": {
    "id": 7,
    "status": "AVAILABLE"   ← Nuevo en inventario
  }
}
```

**Diferencia con SALE:**
- Vehicle.status = AVAILABLE (no SOLD)
- Vehículo entra al inventario de la concesionaria

---

## ⚠️ Ejemplo 3: Errores Comunes

### Error: Sobre-pago
```bash
POST /sales/10/payments

{
  "saleId": 10,
  "amount": 100000,
  "method": "CASH"
}

❌ Response 400:
{
  "error": "BadRequestException",
  "message": "Monto excede el precio final. Restante: 50000"
}
```

Motivo: totalPaid (200000) + amount (100000) > finalPrice (200000)

---

### Error: Pagar operación cerrada
```bash
POST /sales/10/payments

{
  "saleId": 10,
  "amount": 100,
  "method": "CASH"
}

❌ Response 400:
{
  "error": "BadRequestException",
  "message": "No se pueden agregar pagos a una operación entregada"
}
```

Motivo: Sale.status = DELIVERED

---

### Error: Trade-in en vehículo duplicado
```bash
POST /sales/10/trade-ins

{
  "saleId": 10,
  "vehicleId": 3,
  "tradeInValue": 50000
}

❌ Response 400:
{
  "error": "BadRequestException",
  "message": "Vehículo ya está en trade-in de otra operación activa"
}
```

Motivo: Vehicle #3 ya está en Trade-in de otra SALE con status !== DELIVERED

---

### Error: Entregar sin pago completo
```bash
POST /sales/10/deliver

❌ Response 400:
{
  "error": "BadRequestException",
  "message": "No se puede entregar sin pago completo"
}
```

Motivo: totalConfirmed (100000) < finalPrice (200000)

---

## 📊 Estados Finales

### SALE Completada
```
Sale:
  ├─ status: DELIVERED ✅
  ├─ type: SALE
  ├─ totalPaid: 200000 (>= finalPrice)
  └─ payments: [{status: CONFIRMED}, ...]

Vehicle:
  └─ status: SOLD ✅ (fuera de inventario)
```

### PURCHASE Completada
```
Sale:
  ├─ status: DELIVERED ✅
  ├─ type: PURCHASE
  ├─ totalPaid: 150000 (>= finalPrice)
  └─ payments: [{status: CONFIRMED}, ...]

Vehicle:
  └─ status: AVAILABLE ✅ (nuevo en inventario)
```

---

## 🔒 Restricciones por Estado

| Acción | DRAFT | RESERVED | SOLD | DELIVERED |
|--------|-------|----------|------|-----------|
| update basePrice | ✓ | ✗ | ✗ | ✗ |
| addPayment | ✓ | ✓ | ✓ | ✗ |
| confirmPayment | ✓ | ✓ | ✓ | ✗ |
| addTradeIn | ✓ | ✓ | ✓ | ✗ |
| reserve | ✓ | ✗ | ✗ | ✗ |
| deliver | ✗ | ✗ | ✓* | ✗ |
| remove | ✓ | ✗ | ✗ | ✗ |

*Solo si totalPaid >= finalPrice

---

## 🎯 Resumen

✅ **SALE** (venta)
- Cliente compra vehículo existente
- Concesionaria pierde inventario
- Vehículo termina en SOLD

✅ **PURCHASE** (compra)
- Concesionaria compra vehículo
- Concesionaria gana inventario
- Vehículo termina en AVAILABLE

✅ **PAYMENTS**
- PENDING → validar → CONFIRMED
- Suma en totalPaid solo cuando CONFIRMED
- Se puede rechazar (revertir totalPaid)

✅ **TRADE-INS**
- Descuentan del finalPrice
- Vehículos no se duplican (referencia)
- No pueden estar en dos SALE activas

✅ **ESTADO**
- Cambios automáticos según pagos/trade-ins
- NO se modifica desde frontend
- DELIVERED es final (sin reversión)

