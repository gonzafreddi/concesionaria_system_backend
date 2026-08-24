# Auth Global Guards

Este proyecto usa autenticacion JWT global en NestJS. La idea es simple:

- Todas las rutas estan protegidas por defecto.
- El token JWT se lee de forma global.
- El usuario autenticado queda disponible en `req.user`.
- Las rutas publicas se marcan explicitamente con `@Public()`.
- Los permisos por rol se manejan con `@Roles(...)`.

## Como funciona hoy

### 1. Guard global de autenticacion

En [src/auth/auth.module.ts](/home/gfreddi/home/gfreddi/auto3/backend/concesionaria_system_backend/src/auth/auth.module.ts) se registran guards globales con `APP_GUARD`.

Eso hace que Nest ejecute autenticacion en todas las rutas sin tener que agregar `@UseGuards(AuthGuard)` en cada controller.

### 2. Lectura global del token

En [src/auth/auth.guard.ts](/home/gfreddi/home/gfreddi/auto3/backend/concesionaria_system_backend/src/auth/auth.guard.ts):

- Se lee el header `Authorization`
- Se espera el formato `Bearer <token>`
- Se valida el JWT
- Se guarda el payload en `req.user`

Payload esperado:

```ts
{
  id: number;
  email: string;
  role: 'ADMIN' | 'SELLER' | 'MANAGER';
}
```

Si no hay token o es invalido, responde `401 Unauthorized`.

### 3. Rutas publicas

Las rutas que no deben requerir token se marcan con el decorador `@Public()`.

Archivo:

- [src/auth/decorators/public.decorator.ts](/home/gfreddi/home/gfreddi/auto3/backend/concesionaria_system_backend/src/auth/decorators/public.decorator.ts)

Ejemplo:

```ts
@Public()
@Post('login')
login() {
  ...
}
```

Hoy ya estan marcadas como publicas en [src/auth/auth.controller.ts](/home/gfreddi/home/gfreddi/auto3/backend/concesionaria_system_backend/src/auth/auth.controller.ts):

- `POST /auth/login`
- `POST /auth/verify`

## Acceso al usuario autenticado

Una vez que pasa el `AuthGuard`, el usuario queda en `req.user`.

Ejemplo de uso en un controller:

```ts
import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller('me')
export class MeController {
  @Get()
  getProfile(@Req() req: Request) {
    return req['user'];
  }
}
```

Si queres tiparlo mejor, conviene definir un tipo comun para `AuthenticatedRequest`.

## Permisos por rol

### 1. Decorador de roles

Archivo:

- [src/auth/decorators/roles.decorator.ts](/home/gfreddi/home/gfreddi/auto3/backend/concesionaria_system_backend/src/auth/decorators/roles.decorator.ts)

Uso:

```ts
@Roles(UserRole.ADMIN)
```

o multiples roles:

```ts
@Roles(UserRole.ADMIN, UserRole.MANAGER)
```

### 2. Guard global de roles

Archivo:

- [src/auth/roles.guard.ts](/home/gfreddi/home/gfreddi/auto3/backend/concesionaria_system_backend/src/auth/roles.guard.ts)

Este guard:

- Lee los roles requeridos desde metadata
- Toma el rol del usuario desde `req.user.role`
- Si el usuario no tiene permiso, responde `403 Forbidden`

Si una ruta no tiene `@Roles(...)`, entonces alcanza con estar autenticado.

## Como agregar permisos a una ruta

Ejemplo:

```ts
import { Controller, Delete, Param } from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';

@Controller('users')
export class UsersController {
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    ...
  }
}
```

Resultado:

- Si no hay token: `401`
- Si hay token pero el rol no coincide: `403`
- Si hay token y rol valido: entra al handler

## Reglas practicas

- No uses `@Public()` salvo en login, healthchecks o endpoints realmente abiertos.
- Usa `@Roles(...)` solo en rutas que necesiten restriccion adicional.
- Si una ruta solo necesita "usuario logueado", no hace falta `@Roles(...)`.
- El enum de roles actual esta en [src/users/entities/user.entity.ts](/home/gfreddi/home/gfreddi/auto3/backend/concesionaria_system_backend/src/users/entities/user.entity.ts).

Roles disponibles hoy:

- `ADMIN`
- `SELLER`
- `MANAGER`

## Flujo completo

1. Entra la request.
2. El middleware de logs registra la entrada.
3. El `AuthGuard` global valida el JWT.
4. Si el endpoint tiene `@Public()`, salta la validacion.
5. Si el token es valido, se carga `req.user`.
6. El `RolesGuard` verifica `@Roles(...)` si existe.
7. El controller ejecuta la logica.
8. El middleware de logs registra la salida, incluyendo usuario si existe.

## Ejemplos rapidos

### Ruta privada comun

```ts
@Get('profile')
getProfile() {
  ...
}
```

Requiere token, pero no rol especifico.

### Ruta publica

```ts
@Public()
@Get('health')
health() {
  return { ok: true };
}
```

### Ruta solo admin

```ts
@Roles(UserRole.ADMIN)
@Post('create-user')
createUser() {
  ...
}
```

## Matriz de permisos por modulo

La siguiente tabla resume qué roles pueden acceder a cada recurso. Los endpoints que no aparecen con `@Roles(...)` requieren unicamente estar autenticados.

| Modulo | ADMIN | MANAGER | SELLER | Notas |
|--------|:-----:|:-------:|:------:|-------|
| `users` | ✓ | ✗ | ✗ | Solo ADMIN gestiona usuarios |
| `agency-settings` | ✓ (escritura) | ✓ (lectura) | ✗ | Actualizacion solo ADMIN |
| `finance` | ✓ | ✓ | ✗ | Resumen financiero |
| `dashboard` | ✓ | ✓ | ✗ | Metricas generales |
| `expenses` | ✓ | ✓ | ✗ | Gastos generales |
| `vehicle-expenses` | ✓ | ✓ | ✗ | Costos por vehiculo |
| `purchase` | ✓ | ✓ | ✗ | Compras a terceros |
| `consignments` | ✓ | ✓ | ✗ | Consignaciones |
| `pre-sale` | ✓ | ✓ | ✗ | Pre-recepcion de vehiculos |
| `locations` | ✓ | ✓ | ✗ | Ubicaciones/depositos |
| `sales` | ✓ | ✓ | ✓ | Anular/borrar solo ADMIN/MANAGER |
| `payments` | ✓ | ✓ | ✓ | Confirmar/rechazar/eliminar solo ADMIN/MANAGER |
| `quotes` | ✓ | ✓ | ✓ | Cambiar estado/borrar solo ADMIN/MANAGER |
| `vehicles` | ✓ | ✓ | ✓ | Alta/baja/modificacion y movimiento de ubicacion solo ADMIN/MANAGER |
| `service-orders` | ✓ | ✓ | ✓ | Escritura solo ADMIN/MANAGER |
| `clients` | ✓ | ✓ | ✓ | ABM de clientes |
| `inspections` | ✓ | ✓ | ✓ | Inspecciones |
| `vehicle-request` | ✓ | ✓ | ✓ | Solicitudes de vehiculos |
| `documents` | ✓ | ✓ | ✓ | Cualquier usuario autenticado |
| `vehicle-images` | ✓ | ✓ | ✓ | Cualquier usuario autenticado |
| `health` | ✓ | ✓ | ✓ | Publico (`@Public()`) |
| `auth/login`, `auth/refresh`, `auth/verify` | - | - | - | Publicos (`@Public()`) |

> **Regla general**: `ADMIN` puede todo. `MANAGER` administra stock, finanzas, compras y operaciones. `SELLER` opera el dia a dia (ventas, cotizaciones, clientes) pero no puede anular operaciones, confirmar pagos ni ver finanzas.

## Tokens de sesion

- `access_token`: JWT corto (15 minutos) que el frontend envia como `Authorization: Bearer ...`.
- `refresh_token`: JWT largo (7 dias) que el backend entrega en cookie `HttpOnly` y lee unicamente en `POST /auth/refresh`.
- El `AuthGuard` rechaza tokens cuyo `tokenType` no sea `access`.

## Que tocar si cambia algo

### Si queres cambiar que rutas son publicas

Agregar o sacar `@Public()` en el endpoint correspondiente.

### Si queres cambiar logica de autenticacion

Modificar:

- [src/auth/auth.guard.ts](/home/gfreddi/home/gfreddi/auto3/backend/concesionaria_system_backend/src/auth/auth.guard.ts)

### Si queres cambiar logica de permisos

Modificar:

- [src/auth/roles.guard.ts](/home/gfreddi/home/gfreddi/auto3/backend/concesionaria_system_backend/src/auth/roles.guard.ts)

### Si queres agregar mas roles

Modificar el enum:

- [src/users/entities/user.entity.ts](/home/gfreddi/home/gfreddi/auto3/backend/concesionaria_system_backend/src/users/entities/user.entity.ts)

y despues usar esos roles nuevos con `@Roles(...)`.
