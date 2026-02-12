# Módulo de Autenticación (Auth)

## Descripción General

El módulo de autenticación maneja la identificación y autorización de usuarios en la aplicación. Implementa JWT (JSON Web Tokens) para mantener sesiones seguras.

## Características Principales

- ✅ Autenticación por email y contraseña
- ✅ Generación de tokens JWT
- ✅ Validación de tokens con expiración de 24 horas
- ✅ Guard de protección para endpoints
- ✅ Encriptación de contraseñas
- ✅ Manejo robusto de errores

## Arquitectura

```
auth/
├── auth.controller.ts       # Endpoints de autenticación
├── auth.service.ts          # Lógica de autenticación
├── auth.guard.ts            # Guard para proteger rutas
├── auth.module.ts           # Configuración del módulo
├── dto/
│   └── login.dto.ts         # DTO para login
└── README.md                # Esta documentación
```

## DTOs

### LoginDto

```typescript
{
  email: string;      // Email del usuario (requerido, válido)
  password: string;   // Contraseña (requerido, mín. 6 caracteres)
}
```

**Ejemplo:**
```json
{
  "email": "usuario@example.com",
  "password": "MiPassword123!"
}
```

## Endpoints

### 1. POST /auth/login

Autentica un usuario y retorna un token JWT.

**Request:**
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "MiPassword123!"
}
```

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Response (401 Unauthorized):**
```json
{
  "statusCode": 401,
  "message": "Invalid email or password",
  "data": null
}
```

### 2. POST /auth/verify

Verifica que un token JWT sea válido.

**Request:**
```bash
POST /auth/verify
Content-Type: application/json
Authorization: Bearer {token}

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "valid": true,
  "payload": {
    "email": "usuario@example.com",
    "id": 1,
    "role": "user"
  }
}
```

## Servicios

### AuthService

#### `login(loginDto: LoginDto)`

Autentica un usuario por email y contraseña.

- **Parámetros:** `loginDto` con email y password
- **Retorna:** Respuesta con token JWT
- **Errores:** 401 si email o password son inválidos

#### `verifyToken(token: string)`

Verifica y decodifica un token JWT.

- **Parámetros:** Token JWT
- **Retorna:** Payload decodificado
- **Errores:** Lanza UnauthorizedException si token es inválido

#### `extractTokenFromHeader(authHeader: string)`

Extrae el token del header de autorización.

- **Parámetros:** Header de autorización (Bearer token)
- **Retorna:** Token sin prefijo
- **Errores:** Lanza UnauthorizedException si formato es inválido

## Guards

### AuthGuard

Guard que protege endpoints que requieren autenticación.

**Uso:**
```typescript
@UseGuards(AuthGuard)
@Get('protected-route')
protectedRoute() {
  // Solo accesible con token válido
}
```

**Comportamiento:**
1. Extrae token del header Authorization
2. Verifica que sea válido con JwtService
3. Asigna payload al objeto request para usar en handlers
4. Lanza UnauthorizedException si token falta o es inválido

## Configuración JWT

El módulo configura JWT con:

- **Secret:** Obtenido de variable de entorno `JWT_SECRET`
- **Expiración:** 24 horas
- **Algoritmo:** HS256 (por defecto de @nestjs/jwt)

### Variables de Entorno

```env
JWT_SECRET=your-super-secret-key-change-in-production
```

## Flujo de Autenticación

```
┌─────────────┐
│   Usuario   │
└──────┬──────┘
       │
       │ 1. POST /auth/login
       │ (email, password)
       ▼
┌──────────────┐
│ AuthController│
└──────┬───────┘
       │
       │ 2. Validar credenciales
       ▼
┌──────────────┐
│ AuthService  │
└──────┬───────┘
       │
       │ 3. Generar JWT
       │ Payload: {email, id, role}
       ▼
┌──────────────────┐
│ Retornar Token   │
│ access_token: ... │
└──────────────────┘

    Acceso Posterior:

┌──────────────┐
│ Request      │
│ + Token      │
└──────┬───────┘
       │
       │ 1. AuthGuard
       │ Valida token
       ▼
┌──────────────┐
│ JwtService   │
│ verify()     │
└──────┬───────┘
       │
       ├─ Token válido
       │  └─> Continuar a handler
       │
       └─ Token inválido
          └─> 401 Unauthorized
```

## Integración en otros Módulos

### En un Controlador

```typescript
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from './auth/auth.guard';

@Controller('users')
export class UsersController {
  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    // req.user contiene el payload del JWT
    console.log(req.user.id);
  }
}
```

### En App Module

```typescript
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [AuthModule, ...otrosModulos],
})
export class AppModule {}
```

## Mejores Prácticas de Seguridad

1. **Usar HTTPS:** Siempre transmitir tokens sobre conexiones encriptadas
2. **Secreto Seguro:** Cambiar JWT_SECRET en producción a una cadena muy fuerte
3. **Expiración:** Los tokens de 24 horas son razonables, ajustar según necesidad
4. **Refresh Tokens:** Considerar implementar refresh tokens para sesiones largas
5. **CORS:** Configurar CORS adecuadamente para evitar ataques
6. **Rate Limiting:** Limitar intentos de login fallidos
7. **Contraseñas:** Usar hashing fuerte (bcrypt/Argon2) para almacenamiento

## Manejo de Errores

| Código | Mensaje | Causa |
|--------|---------|-------|
| 200 | Login successful | Autenticación correcta |
| 400 | Datos inválidos | Email o password faltante o inválido |
| 401 | Invalid email or password | Credenciales incorrectas |
| 401 | Token inválido o expirado | Token JWT vencido o corrupto |
| 401 | No authorization header | Header Authorization faltante |
| 401 | Invalid authorization scheme | Header con formato incorrecto |

## Testing

### Test de Login Exitoso

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "password": "MiPassword123!"
  }'
```

### Test de Endpoint Protegido

```bash
curl -X GET http://localhost:3000/users/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Roadmap Futuro

- [ ] Implementar refresh tokens
- [ ] Two-factor authentication (2FA)
- [ ] OAuth2 / OpenID Connect
- [ ] Rate limiting en login
- [ ] Auditoría de intentos fallidos
- [ ] Roles y permisos granulares
- [ ] Social login (Google, GitHub)
