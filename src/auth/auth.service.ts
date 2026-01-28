import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { comparePassword } from 'src/utils/encrypt';
import { httpResponseType } from 'src/types/http/response,type';

const response: httpResponseType = {
  statusCode: 0,
  message: '',
  data: null,
};

/**
 * Servicio de autenticación
 * Maneja el login de usuarios y generación de tokens JWT
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Autentica un usuario por email y contraseña
   * @param loginDto - Datos de login (email y password)
   * @returns Respuesta con token JWT si la autenticación es exitosa
   * @throws UnauthorizedException si email o password son inválidos
   */
  async login(loginDto: LoginDto) {
    const user = await this.userService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = comparePassword(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      statusCode: 200,
      message: 'Login successful',
      data: {
        access_token: this.jwtService.sign(payload),
      },
    };
  }

  /**
   * Verifica y decodifica un token JWT
   * @param token - Token JWT a verificar
   * @returns Payload decodificado del token
   */
  verifyToken(token: string): Record<string, unknown> {
    try {
      return this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }

  /**
   * Extrae y valida el token del header de autorización
   * @param authHeader - Header de autorización (Bearer token)
   * @returns Token sin el prefijo "Bearer "
   */
  extractTokenFromHeader(authHeader: string): string {
    if (!authHeader) {
      throw new UnauthorizedException('No authorization header provided');
    }
    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer') {
      throw new UnauthorizedException('Invalid authorization scheme');
    }
    return token;
  }
}
