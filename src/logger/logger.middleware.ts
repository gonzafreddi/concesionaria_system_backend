import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

const SENSITIVE_QUERY_KEYS = ['password', 'token', 'refresh_token', 'secret'];

type AuthenticatedRequest = Request & {
  user?: {
    id?: number | string;
    role?: string;
  };
};

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggerMiddleware.name);

  use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const startedAt = Date.now();
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const url = this.sanitizeUrl(req.originalUrl || req.url);

    this.logger.log(`Incoming request ${req.method} ${url} - IP: ${ip}`);

    res.on('finish', () => {
      const durationMs = Date.now() - startedAt;
      const userInfo = req.user
        ? ` - User: (id: ${req.user.id ?? 'unknown'}, role: ${req.user.role || 'unknown'})`
        : ' - User: anonymous';

      this.logger.log(
        `Completed request ${req.method} ${url} - ${res.statusCode} - ${durationMs}ms${userInfo}`,
      );
    });

    next();
  }

  private sanitizeUrl(url: string): string {
    try {
      const parsed = new URL(url, 'http://localhost');

      for (const key of parsed.searchParams.keys()) {
        if (
          SENSITIVE_QUERY_KEYS.some((sensitive) =>
            key.toLowerCase().includes(sensitive),
          )
        ) {
          parsed.searchParams.set(key, '[REDACTED]');
        }
      }

      return parsed.pathname + parsed.search;
    } catch {
      return url;
    }
  }
}
