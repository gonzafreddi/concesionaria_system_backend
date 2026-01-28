import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiHeader,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

/**
 * Controlador de autenticación
 * Maneja los endpoints relacionados con login y autenticación JWT
 */
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Endpoint de login
   * Autentica un usuario con email y contraseña
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login de usuario',
    description:
      'Autentica un usuario con sus credenciales (email y contraseña) y retorna un token JWT válido por 24 horas',
  })
  @ApiBody({
    description: 'Credenciales de acceso del usuario',
    type: LoginDto,
    examples: {
      usuarioValido: {
        description: 'Ejemplo de usuario válido',
        value: {
          email: 'usuario@example.com',
          password: 'MiPassword123!',
        },
      },
      administrador: {
        description: 'Ejemplo de credenciales de administrador',
        value: {
          email: 'admin@concesionaria.com',
          password: 'AdminPassword123!',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso - Retorna token JWT',
    example: {
      statusCode: 200,
      message: 'Login successful',
      data: {
        access_token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzdWFyaW9AZXhhbXBsZS5jb20iLCJpZCI6MSwicm9sZSI6InVzZXIifQ.signature',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Email o contraseña inválidos',
    example: {
      statusCode: 401,
      message: 'Invalid email or password',
      data: null,
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos (email o contraseña faltante)',
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * Endpoint para verificar token
   * Valida que un token JWT sea válido
   */
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verificar token JWT',
    description: 'Verifica que un token JWT sea válido y no esté expirado',
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Token JWT en formato: Bearer {token}',
    example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @ApiResponse({
    status: 200,
    description: 'Token válido',
    example: {
      valid: true,
      payload: {
        email: 'usuario@example.com',
        id: 1,
        role: 'user',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido o expirado',
  })
  verifyToken(@Body('token') token: string) {
    const payload = this.authService.verifyToken(token);
    return {
      valid: true,
      payload,
    };
  }
}
