import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiHeader,
} from '@nestjs/swagger';
import type { CookieOptions, Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Public } from './decorators/public.decorator';
import { LoginRateLimitGuard } from './login-rate-limit.guard';

const REFRESH_COOKIE_NAME = 'refresh_token';
const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

type AuthenticatedRequest = Request & {
  user?: {
    id?: number;
  };
};

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  @UseGuards(LoginRateLimitGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login de usuario',
    description:
      'Autentica un usuario con sus credenciales, retorna access token y guarda refresh token en cookie HttpOnly',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login exitoso' })
  @ApiResponse({ status: 401, description: 'Email o contraseña inválidos' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(loginDto);
    const { refresh_token: refreshToken, ...publicData } = result.data;

    this.setRefreshCookie(response, refreshToken);

    return {
      ...result,
      data: publicData,
    };
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar access token usando cookie HttpOnly' })
  @ApiResponse({ status: 200, description: 'Token renovado' })
  @ApiResponse({
    status: 401,
    description: 'Refresh token inválido o expirado',
  })
  async refresh(@Req() request: Request) {
    const refreshToken = this.getRefreshTokenFromRequest(request);

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token requerido');
    }

    return this.authService.refreshAccessToken(refreshToken);
  }

  @Post('logout')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cerrar sesión y limpiar cookie de refresh' })
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie(REFRESH_COOKIE_NAME, this.getRefreshCookieOptions());

    return {
      statusCode: 200,
      message: 'Logout successful',
    };
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cambiar la contraseña del usuario autenticado',
    description:
      'Permite a un usuario cambiar su propia contraseña proporcionando la contraseña actual.',
  })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({ status: 200, description: 'Contraseña actualizada' })
  @ApiResponse({ status: 401, description: 'Contraseña actual incorrecta' })
  async changePassword(
    @Req() request: Request,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const userId = (request as AuthenticatedRequest).user?.id;

    if (!userId) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    return this.authService.changePassword(userId, changePasswordDto);
  }

  @Post('verify')
  @Public()
  @UseGuards(LoginRateLimitGuard)
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
  @ApiResponse({ status: 200, description: 'Token válido' })
  @ApiResponse({ status: 401, description: 'Token inválido o expirado' })
  verifyToken(@Body('token') token: string) {
    const payload = this.authService.verifyToken(token);
    return {
      valid: true,
      payload,
    };
  }

  private setRefreshCookie(response: Response, refreshToken: string) {
    response.cookie(
      REFRESH_COOKIE_NAME,
      refreshToken,
      this.getRefreshCookieOptions(REFRESH_COOKIE_MAX_AGE_MS),
    );
  }

  private getRefreshCookieOptions(maxAge?: number): CookieOptions {
    const sameSite = this.getCookieSameSite();
    const options: CookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' || sameSite === 'none',
      sameSite,
      path: '/',
    };

    if (maxAge !== undefined) {
      options.maxAge = maxAge;
    }

    if (process.env.REFRESH_COOKIE_DOMAIN) {
      options.domain = process.env.REFRESH_COOKIE_DOMAIN;
    }

    return options;
  }

  private getCookieSameSite(): CookieOptions['sameSite'] {
    const value = process.env.REFRESH_COOKIE_SAME_SITE?.toLowerCase();

    if (value === 'strict' || value === 'none') {
      return value;
    }

    return 'lax';
  }

  private getRefreshTokenFromRequest(request: Request): string | null {
    const cookieHeader = request.headers.cookie;

    if (!cookieHeader) {
      return null;
    }

    const cookies = cookieHeader.split(';').map((cookie) => cookie.trim());
    const refreshCookie = cookies.find((cookie) =>
      cookie.startsWith(REFRESH_COOKIE_NAME + '='),
    );

    if (!refreshCookie) {
      return null;
    }

    return decodeURIComponent(refreshCookie.split('=').slice(1).join('='));
  }
}
