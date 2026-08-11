import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/entities/user.entity';
import { comparePassword } from '../utils/encrypt';

type AuthSessionPayload = {
  id: number;
  email: string;
  role: UserRole;
};

type AuthTokenPayload = AuthSessionPayload & {
  tokenType: 'access' | 'refresh';
};

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.userService.findByEmail(loginDto.email);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = comparePassword(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = this.createTokenPayload(user.id, user.email, user.role);

    return {
      statusCode: 200,
      message: 'Login successful',
      data: {
        access_token: this.signAccessToken(payload),
        refresh_token: this.signRefreshToken(payload),
      },
    };
  }

  async refreshAccessToken(refreshToken: string) {
    const payload = this.verifyRefreshToken(refreshToken);
    const user = await this.userService.findOne(payload.id);

    if (!user.isActive) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    const nextPayload = this.createTokenPayload(user.id, user.email, user.role);

    return {
      statusCode: 200,
      message: 'Token refreshed',
      data: {
        access_token: this.signAccessToken(nextPayload),
      },
    };
  }

  verifyToken(token: string): Record<string, unknown> {
    try {
      return this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }

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

  private createTokenPayload(
    id: number,
    email: string,
    role: UserRole,
  ): AuthSessionPayload {
    return { id, email, role };
  }

  private signAccessToken(payload: AuthSessionPayload): string {
    return this.jwtService.sign(
      { ...payload, tokenType: 'access' },
      { expiresIn: '15m' },
    );
  }

  private signRefreshToken(payload: AuthSessionPayload): string {
    return this.jwtService.sign(
      { ...payload, tokenType: 'refresh' },
      { expiresIn: '7d' },
    );
  }

  private verifyRefreshToken(token: string): AuthTokenPayload {
    try {
      const payload = this.jwtService.verify<AuthTokenPayload>(token);

      if (payload.tokenType !== 'refresh') {
        throw new UnauthorizedException('Token de refresh invalido');
      }

      return payload;
    } catch {
      throw new UnauthorizedException('Token de refresh invalido o expirado');
    }
  }
}
