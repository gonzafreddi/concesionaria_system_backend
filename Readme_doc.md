# Sistema de Gestión para Concesionaria

## 📌 Descripción general

Este proyecto es un **sistema de gestión integral para concesionarias de autos y motos**, pensado para cubrir todo el flujo comercial real:

* gestión de clientes
* control de stock de vehículos
* presupuestos
* ventas
* firma digital
* seguimiento de clientes interesados cuando no hay stock disponible

El diseño de la base de datos está pensado para ser **escalable, trazable y realista**, y se adapta perfectamente a un backend en **NestJS + TypeORM + PostgreSQL**.

---

## 🧠 Objetivo del modelo de datos

El objetivo principal es:

* no mezclar conceptos (presupuesto ≠ venta ≠ interés)
* mantener historial completo
* permitir vender incluso antes de que el vehículo esté en stock
* facilitar auditoría y control interno

---

## 🧱 Entidades y estructura de la base de datos

A continuación se detallan **todas las tablas del sistema con sus campos y propósito**, para que cualquier desarrollador o stakeholder entienda exactamente qué almacena cada entidad.

---

## 👤 Users

Usuarios internos del sistema (vendedores, administradores, gerentes).

**Campos:**

* id: identificador único
* name: nombre del usuario
* email: email único de acceso
* role: rol del usuario (ADMIN | SELLER | MANAGER)
* created_at: fecha de creación

---

## 🧑‍💼 Clients

Clientes finales de la concesionaria.

**Campos:**

* id: identificador único
* first_name: nombre
* last_name: apellido
* dni: documento
* phone: teléfono de contacto
* email: email
* signature_data: firma digital del cliente (base64 o path)
* signature_created_at: fecha en la que se capturó la firma
* created_at: fecha de alta

---

## 🚗 Vehicles

Vehículos disponibles o vendidos.

**Campos:**

* id: identificador único
* type: tipo de vehículo (AUTO | MOTO)
* brand: marca
* model: modelo
* year: año
* color: color
* price: precio de lista
* status: estado (AVAILABLE | RESERVED | SOLD)
* created_at: fecha de carga

---

## 🧲 Vehicle Requests

Intereses de clientes por vehículos que no están en stock.

**Campos:**

* id: identificador único
* client_id: cliente interesado
* user_id: vendedor que registró la búsqueda
* type: tipo de vehículo buscado
* brand: marca buscada
* model: modelo buscado
* year_from: año mínimo aceptado
* year_to: año máximo aceptado
* color_preference: color preferido
* max_price: precio máximo
* notes: observaciones
* status: estado (OPEN | MATCHED | CANCELLED | EXPIRED)
* matched_vehicle_id: vehículo asociado cuando ingresa stock
* created_at: fecha de registro

---

## 🧾 Quotes

Presupuestos generados para clientes.

**Campos:**

* id: identificador único
* client_id: cliente
* user_id: vendedor
* vehicle_id: vehículo presupuestado
* base_price: precio base
* final_price: precio final
* status: estado (DRAFT | SENT | ACCEPTED | REJECTED)
* created_at: fecha de creación

---

## 🧾 Sales

Ventas confirmadas.

**Campos:**

* id: identificador único
* quote_id: presupuesto origen
* client_id: cliente
* vehicle_id: vehículo vendido
* user_id: vendedor
* total_amount: monto total
* sale_date: fecha de venta

---

## 💳 Payments

Pagos asociados a una venta.

**Campos:**

* id: identificador único
* sale_id: venta asociada
* amount: monto del pago
* method: método de pago
* status: estado del pago (PENDING | PAID)
* paid_at: fecha de pago

---

---

## Vehicle acquisition

Tipos de adquisiciones de los vehiculos.
Por ejemplo Compra directa , permuta , consignacion

* id: identificador único
* name : Nombre del tipo de adquisicion 
* active : Si esta activa 
* vehicles: la asociacion a los vehiculos

---

## 📄 Consignments

Registro operativo de vehículos recibidos en consignación. Esta entidad orquesta:

* el vehículo consignado
* el cliente dueño del vehículo
* el precio de toma acordado
* el precio estimado de venta
* el estado de la consignación

**Campos:**

* id: identificador único
* vehicle_id: vehículo consignado
* owner_client_id: cliente dueño del vehículo
* take_price: precio de toma acordado con el dueño
* estimated_sale_price: precio estimado de venta al público
* status: estado (ACTIVE | RESERVED | SOLD | RETURNED | CANCELLED)
* notes: observaciones comerciales o administrativas
* created_at: fecha de alta
* updated_at: última actualización

**Reglas:**

* al crear una consignación, el vehículo pasa a `entryType = CONSIGNMENT`
* el vehículo sincroniza `ownerClientId` con el dueño de la consignación
* el `estimated_sale_price` no puede ser menor al `take_price`
* un vehículo no puede tener dos consignaciones activas al mismo tiempo
* cuando se crea una venta del vehículo consignado y este queda reservado, la consignación pasa a `RESERVED`
* cuando la venta queda confirmada, la consignación pasa a `SOLD`

## 🛠️ Tecnologías objetivo

* Backend: NestJS
* ORM: TypeORM
* Base de datos: PostgreSQL
* Firma digital: Tablet / Base64 / Storage externo

---

## 🚀 Escalabilidad futura

El modelo permite agregar fácilmente:

* notificaciones automáticas
* CRM avanzado
* reportes comerciales
* integración con WhatsApp / Email
* múltiples sucursales

---

## ✅ Conclusión

Este modelo refleja el funcionamiento real de una concesionaria moderna, separando correctamente cada etapa del proceso comercial y permitiendo crecer sin rehacer la base.

Ideal para un sistema profesional, auditable y escalable.
