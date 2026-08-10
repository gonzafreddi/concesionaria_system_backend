import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';

interface LoginAttemptBucket {
  count: number;
  resetAt: number;
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

@Injectable()
export class LoginRateLimitGuard implements CanActivate {
  private readonly buckets = new Map<string, LoginAttemptBucket>();
  private readonly maxAttempts = parsePositiveInt(
    process.env.LOGIN_RATE_LIMIT_MAX,
    10,
  );
  private readonly windowMs = parsePositiveInt(
    process.env.LOGIN_RATE_LIMIT_WINDOW_MS,
    60_000,
  );

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const key = this.getKey(request);
    const now = Date.now();
    const bucket = this.buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      this.buckets.set(key, { count: 1, resetAt: now + this.windowMs });
      return true;
    }

    bucket.count += 1;

    if (bucket.count > this.maxAttempts) {
      throw new HttpException(
        'Demasiados intentos de inicio de sesión. Intente nuevamente más tarde.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  private getKey(request: Request): string {
    const forwardedFor = request.headers['x-forwarded-for'];
    const ip = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : forwardedFor?.split(',')[0]?.trim() || request.ip || 'unknown';
    const email = this.getEmail(request.body);

    return `${ip}:${email}`;
  }

  private getEmail(body: unknown): string {
    if (body && typeof body === 'object' && 'email' in body) {
      const email = (body as { email?: unknown }).email;
      return typeof email === 'string' ? email.toLowerCase().trim() : '';
    }

    return '';
  }
}
