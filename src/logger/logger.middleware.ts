import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

type AuthenticatedRequest = Request & {
  user?: {
    id?: number | string;
    email?: string;
    role?: string;
  };
};

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggerMiddleware.name);

  use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const startedAt = Date.now();
    const ip = req.ip || req.socket.remoteAddress || 'unknown';

    this.logger.log(`Incoming request ${req.method} ${req.originalUrl || req.url} - IP: ${ip}`);

    res.on('finish', () => {
      const durationMs = Date.now() - startedAt;
      const userInfo = req.user
        ? ` - User: ${req.user.email || 'unknown'} (id: ${req.user.id ?? 'unknown'}, role: ${req.user.role || 'unknown'})`
        : ' - User: anonymous';

      this.logger.log(
        `Completed request ${req.method} ${req.originalUrl || req.url} - ${res.statusCode} - ${durationMs}ms${userInfo}`,
      );
    });

    next();
  }
}
