# Ejemplo de `.env`

Usa este archivo como referencia para crear tu `.env` local.

```env
# App
NODE_ENV=development
PORT=3001
ENABLE_SWAGGER=true
TYPEORM_SYNCHRONIZE=false

# CORS
# Separar multiples origenes con coma
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Auth
JWT_SECRET=cambiar-por-un-secret-seguro
ADMIN_EMAIL=admin@concesionaria.com
ADMIN_PASSWORD=admin123
ADMIN_NAME=Administrador
ADMIN_RESET_PASSWORD=false

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=concesionaria

# Cloudinary
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

## Notas

- En produccion, `NODE_ENV=production`, `JWT_SECRET`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`, `CORS_ORIGINS` y las variables de Cloudinary son obligatorias al iniciar.
- `TYPEORM_SYNCHRONIZE` se maneja desde `.env`. Para el primer arranque en una base vacia podés usar `true`; despues de crear las tablas, volver a `false`.
- `npm run seed:admin` crea el usuario inicial. Por defecto usa `admin@concesionaria.com` / `admin123`. Si el usuario ya existe, no pisa la contraseña salvo `ADMIN_RESET_PASSWORD=true`.
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS` y `DB_NAME` tambien los usa `npm run db:migrate`.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` y `CLOUDINARY_API_SECRET` son obligatorias para subir y eliminar imágenes de vehículos.
- Si no definis `CORS_ORIGINS`, la app deja `origin: false`.
- Si no definis `PORT`, la app arranca en `3001`.
- Si no definis `ENABLE_SWAGGER=true`, Swagger no se expone en `/api/docs`.
- En produccion se recomienda `ENABLE_SWAGGER=false` salvo que se publique detras de una red privada o auth externa.
