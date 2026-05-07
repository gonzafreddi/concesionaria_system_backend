# Ejemplo de `.env`

Usa este archivo como referencia para crear tu `.env` local.

```env
# App
PORT=3001
ENABLE_SWAGGER=true

# CORS
# Separar multiples origenes con coma
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Auth
JWT_SECRET=cambiar-por-un-secret-seguro

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

- `JWT_SECRET` conviene tratarla como obligatoria, aunque el codigo actual no valida su ausencia al iniciar.
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS` y `DB_NAME` tambien los usa `npm run db:migrate`.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` y `CLOUDINARY_API_SECRET` son obligatorias para subir y eliminar imágenes de vehículos.
- Si no definis `CORS_ORIGINS`, la app deja `origin: false`.
- Si no definis `PORT`, la app arranca en `3001`.
- Si no definis `ENABLE_SWAGGER=true`, Swagger no se expone en `/api/docs`.
