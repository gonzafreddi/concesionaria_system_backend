# Production Readiness

## Estado

El backend queda preparado para salir a produccion cuando estos comandos pasan en CI o en una maquina Linux con Node:

```bash
npm ci
npm run lint:check
npm test
npm run test:e2e
npm run build
npm run seed:admin:prod
npm run start:prod
```

## Variables obligatorias en produccion

```env
NODE_ENV=production
PORT=3001
ENABLE_SWAGGER=false
TYPEORM_SYNCHRONIZE=false
CORS_ORIGINS=https://frontend.example.com
JWT_SECRET=generar-un-secreto-largo-y-aleatorio
# Opcional segun dominio de frontend/backend
# REFRESH_COOKIE_DOMAIN=.example.com
# REFRESH_COOKIE_SAME_SITE=lax
DB_HOST=postgres-host
DB_PORT=5432
DB_USER=postgres-user
DB_PASS=postgres-password
DB_NAME=concesionaria
CLOUDINARY_CLOUD_NAME=cloud-name
CLOUDINARY_API_KEY=api-key
CLOUDINARY_API_SECRET=api-secret
ADMIN_EMAIL=admin@auto3.com
ADMIN_PASSWORD=admin123
ADMIN_NAME=Administrador
ADMIN_RESET_PASSWORD=false
```

## Checklist previo al deploy

- Ejecutar `npm run db:migrate` en desarrollo o `npm run db:migrate:prod` despues del build contra la base de produccion antes de levantar la nueva version.
- Confirmar que la migracion `migrations/20260802_locations_module.sql` se aplico antes de usar ubicaciones, asignacion de vehiculos e historial de movimientos.
- Ejecutar `npm run seed:admin` en desarrollo o `npm run seed:admin:prod` despues del build para crear el primer usuario administrador.
- Para el primer arranque en una base vacia se puede usar `TYPEORM_SYNCHRONIZE=true`; despues de crear las tablas, cambiarlo a `false` y reiniciar.
- Confirmar que `CORS_ORIGINS` solo incluye dominios reales del frontend.
- Confirmar que `ENABLE_SWAGGER=false` o que `/api/docs` queda detras de una capa privada.
- Confirmar que `/health` responde `200` despues del deploy.
- Probar login, carga de documentos, carga de imagenes y flujo de venta en staging.
- Cambiar la contraseña inicial del admin despues del primer login.
- Confirmar en el navegador que `POST /auth/login` setea la cookie `refresh_token` como `HttpOnly`.
- Confirmar que al recargar la pagina el frontend llama `POST /auth/refresh` y recupera sesion sin token en `localStorage`.

## Sesion y cookies

La sesion tiene dos piezas:

- `access_token`: token corto que el frontend mantiene solo en memoria y manda como `Authorization: Bearer ...`.
- `refresh_token`: token largo que el backend guarda en cookie `HttpOnly`. JavaScript no puede leerlo; solo el navegador lo envia automaticamente a `/auth/refresh`.

Flujo normal:

```text
Login:
Browser/Frontend          Backend
      | POST /auth/login     |
      | email/password       |
      |--------------------->|
      |                      | valida usuario
      |                      | crea access_token + refresh_token
      | access_token         |
      | Set-Cookie refresh   |
      |<---------------------|
      | guarda access token solo en memoria
```

Renovacion:

```text
API request con access vencido:
Browser/Frontend          Backend
      | GET /recurso         |
      | Bearer access viejo  |
      |--------------------->|
      | 401                  |
      |<---------------------|
      | POST /auth/refresh   |
      | cookie refresh_token |
      |--------------------->|
      | access_token nuevo   |
      |<---------------------|
      | reintenta GET /recurso con Bearer nuevo
```

Escenarios de deploy:

```text
Caso A: proxy bajo el mismo sitio. Recomendado/simple.

https://midominio.com
  /               -> frontend
  /backend-api    -> backend

Env backend:
REFRESH_COOKIE_DOMAIN no se define
REFRESH_COOKIE_SAME_SITE no se define, usa lax
```

```text
Caso B: frontend y backend en subdominios distintos.

https://app.midominio.com  -> frontend
https://api.midominio.com  -> backend

Env backend:
REFRESH_COOKIE_DOMAIN=.midominio.com
REFRESH_COOKIE_SAME_SITE=none

Requiere HTTPS. SameSite=none fuerza cookie Secure.
```

Para el despliegue actual con `/backend-api`, no hace falta definir `REFRESH_COOKIE_DOMAIN` ni `REFRESH_COOKIE_SAME_SITE`.

## Seguridad aplicada

- Las rutas quedan protegidas por auth global salvo las marcadas con `@Public()`.
- `/health` es publico para load balancers y monitoreo.
- `/documents` requiere usuario autenticado.
- `/users` requiere rol `ADMIN`.
- TypeORM no sincroniza esquema automaticamente en produccion.
- El refresh token no se acepta como `Authorization: Bearer`; el guard solo permite tokens de tipo `access`.
- El entrypoint de produccion es `dist/src/main.js` porque el build tambien compila scripts fuera de `src`.
