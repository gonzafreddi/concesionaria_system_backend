import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

/**
 * Guard de autenticación JWT
 * Valida que las solicitudes incluyan un token JWT válido
 * Se aplica a nivel de ruta para proteger endpoints
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  /**
   * Verifica si la solicitud tiene un token JWT válido
   * @param context - Contexto de ejecución de NestJS
   * @returns true si el token es válido, false en caso contrario
   * @throws UnauthorizedException si no hay token o es inválido
   */
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const payload = this.jwtService.verify(token);
      // Asignar el payload al request para usar en handlers
      (request as unknown as Record<string, unknown>)['user'] = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  /**
   * Extrae el token del header de autorización
   * @param request - Objeto de solicitud HTTP
   * @returns Token JWT o undefined si no existe
   */
  private extractToken(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return undefined;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedException('Invalid authorization header format');
    }

    return parts[1];
  }
}
