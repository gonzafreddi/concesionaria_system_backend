# Ejemplos de Uso del Módulo Auth

## Ejemplos cURL

### 1. Login de Usuario

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "password": "MiPassword123!"
  }'
```

**Respuesta exitosa (200):**
```json
{
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzdWFyaW9AZXhhbXBsZS5jb20iLCJpZCI6MSwicm9sZSI6InVzZXIiLCJpYXQiOjE3MDMyNDU2MzIsImV4cCI6MTcwMzMzMjAzMn0.abc123def456"
  }
}
```

**Respuesta fallida (401):**
```json
{
  "statusCode": 401,
  "message": "Invalid email or password",
  "data": null
}
```

### 2. Verificar Token

```bash
curl -X POST http://localhost:3000/auth/verify \
  -H "Content-Type: application/json" \
  -d '{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzdWFyaW9AZXhhbXBsZS5jb20iLCJpZCI6MSwicm9sZSI6InVzZXIiLCJpYXQiOjE3MDMyNDU2MzIsImV4cCI6MTcwMzMzMjAzMn0.abc123def456"
  }'
```

**Respuesta (200):**
```json
{
  "valid": true,
  "payload": {
    "email": "usuario@example.com",
    "id": 1,
    "role": "user",
    "iat": 1703245632,
    "exp": 1703332032
  }
}
```

### 3. Acceder a Endpoint Protegido

```bash
curl -X GET http://localhost:3000/users/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzdWFyaW9AZXhhbXBsZS5jb20iLCJpZCI6MSwicm9sZSI6InVzZXIiLCJpYXQiOjE3MDMyNDU2MzIsImV4cCI6MTcwMzMzMjAzMn0.abc123def456"
```

**Sin token:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

---

## Ejemplos con JavaScript/Fetch

### Login

```javascript
async function login(email, password) {
  const response = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  
  if (data.statusCode === 200) {
    // Guardar token en localStorage
    localStorage.setItem('access_token', data.data.access_token);
    console.log('Login exitoso');
  } else {
    console.error('Error en login:', data.message);
  }

  return data;
}

// Uso
login('usuario@example.com', 'MiPassword123!');
```

### Acceder a Endpoint Protegido

```javascript
async function fetchProtectedData() {
  const token = localStorage.getItem('access_token');

  const response = await fetch('http://localhost:3000/users/profile', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  return data;
}

// Uso
fetchProtectedData();
```

### Interceptor de Solicitudes

```javascript
// Crear instancia de fetch con token automático
async function apiCall(url, options = {}) {
  const token = localStorage.getItem('access_token');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Si obtenemos 401, limpiar token
  if (response.status === 401) {
    localStorage.removeItem('access_token');
    window.location.href = '/login';
  }

  return response.json();
}

// Uso
apiCall('http://localhost:3000/users/profile');
```

---

## Ejemplos con Axios

### Configurar Interceptor

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

// Interceptor de solicitud
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Uso del API

```javascript
import api from './api';

// Login
async function login(email, password) {
  try {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('access_token', data.data.access_token);
    return data;
  } catch (error) {
    console.error('Login error:', error.response?.data?.message);
  }
}

// Acceder endpoint protegido
async function getProfile() {
  try {
    const { data } = await api.get('/users/profile');
    return data;
  } catch (error) {
    console.error('Error:', error.response?.data?.message);
  }
}

// Uso
await login('usuario@example.com', 'MiPassword123!');
const profile = await getProfile();
console.log(profile);
```

---

## Ejemplos en NestJS Controller

### Usando AuthGuard en un Controlador

```typescript
import { UseGuards, Request, Controller, Get } from '@nestjs/common';
import { AuthGuard } from './auth/auth.guard';

@Controller('users')
export class UsersController {
  
  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    // req.user contiene el payload del JWT
    return {
      message: 'Perfil del usuario',
      userId: req.user.id,
      email: req.user.email,
      role: req.user.role,
    };
  }

  @UseGuards(AuthGuard)
  @Get('data')
  getData(@Request() req: any) {
    // Solo usuarios con rol 'admin' pueden acceder
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Solo administradores pueden acceder');
    }
    return { data: 'Información sensible' };
  }
}
```

### Guard Personalizado por Rol

```typescript
import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from './auth.guard';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    
    if (request.user?.role !== 'admin') {
      throw new ForbiddenException('Solo administradores pueden acceder');
    }
    
    return true;
  }
}

// Uso
@UseGuards(AuthGuard, AdminGuard)
@Get('admin-panel')
getAdminPanel() {
  return { message: 'Panel de administrador' };
}
```

---

## Ejemplos de Respuestas de Error

### Email o Contraseña Inválidos

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "invalid@example.com", "password": "wrongpassword"}'
```

```json
{
  "statusCode": 401,
  "message": "Invalid email or password",
  "data": null
}
```

### Token Expirado

```bash
curl -X POST http://localhost:3000/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"token": "expiredtoken123"}'
```

```json
{
  "statusCode": 401,
  "message": "Token inválido o expirado",
  "error": "Unauthorized"
}
```

### Datos Faltantes

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "usuario@example.com"}'
```

```json
{
  "statusCode": 400,
  "message": "Bad Request",
  "error": [
    {
      "field": "password",
      "message": "password should not be empty"
    }
  ]
}
```

---

## Mejores Prácticas

1. **Almacenamiento de Token:**
   - ✅ localStorage (para persistencia entre sesiones)
   - ✅ sessionStorage (para sesiones únicas)
   - ❌ Variable global (se pierde al refrescar)

2. **Seguridad:**
   - ✅ Usar HTTPS en producción
   - ✅ Configurar sameSite en cookies
   - ✅ Implementar CORS correctamente
   - ❌ Exposer token en URL

3. **Manejo de Sesiones:**
   - ✅ Implementar refresh tokens para sesiones largas
   - ✅ Limpiar token en logout
   - ✅ Redirigir a login al expirar token

4. **Testing:**
   - ✅ Probar con token válido
   - ✅ Probar con token expirado
   - ✅ Probar sin token
   - ✅ Probar con credenciales inválidas
