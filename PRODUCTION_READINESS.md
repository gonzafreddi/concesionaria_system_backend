# Production Readiness

## Estado

El backend queda preparado para salir a produccion cuando estos comandos pasan en CI o en una maquina Linux con Node:

```bash
npm ci
npm run lint:check
npm test
npm run test:e2e
npm run build
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
DB_HOST=postgres-host
DB_PORT=5432
DB_USER=postgres-user
DB_PASS=postgres-password
DB_NAME=concesionaria
CLOUDINARY_CLOUD_NAME=cloud-name
CLOUDINARY_API_KEY=api-key
CLOUDINARY_API_SECRET=api-secret
```

## Checklist previo al deploy

- Ejecutar `npm run db:migrate` en desarrollo o `npm run db:migrate:prod` despues del build contra la base de produccion antes de levantar la nueva version.
- Confirmar que `TYPEORM_SYNCHRONIZE=false`.
- Confirmar que `CORS_ORIGINS` solo incluye dominios reales del frontend.
- Confirmar que `ENABLE_SWAGGER=false` o que `/api/docs` queda detras de una capa privada.
- Confirmar que `/health` responde `200` despues del deploy.
- Probar login, carga de documentos, carga de imagenes y flujo de venta en staging.

## Seguridad aplicada

- Las rutas quedan protegidas por auth global salvo las marcadas con `@Public()`.
- `/health` es publico para load balancers y monitoreo.
- `/documents` requiere usuario autenticado.
- `/users` requiere rol `ADMIN`.
- TypeORM no sincroniza esquema automaticamente en produccion.
- El entrypoint de produccion es `dist/src/main.js` porque el build tambien compila scripts fuera de `src`.
