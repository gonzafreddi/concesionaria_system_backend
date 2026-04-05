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
```

## Notas

- `JWT_SECRET` conviene tratarla como obligatoria, aunque el codigo actual no valida su ausencia al iniciar.
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS` y `DB_NAME` tambien los usa `npm run db:migrate`.
- Si no definis `CORS_ORIGINS`, la app deja `origin: false`.
- Si no definis `PORT`, la app arranca en `3001`.
- Si no definis `ENABLE_SWAGGER=true`, Swagger no se expone en `/api/docs`.
