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
    const url = req.originalUrl || req.url;
    const requestBody = this.shouldLogBody(req.method, url)
      ? ` - Body: ${this.serializeBody(req.body)}`
      : '';

    this.logger.log(
      `Incoming request ${req.method} ${url} - IP: ${ip}${requestBody}`,
    );

    res.on('finish', () => {
      const durationMs = Date.now() - startedAt;
      const userInfo = req.user
        ? ` - User: ${req.user.email || 'unknown'} (id: ${req.user.id ?? 'unknown'}, role: ${req.user.role || 'unknown'})`
        : ' - User: anonymous';

      this.logger.log(
        `Completed request ${req.method} ${url} - ${res.statusCode} - ${durationMs}ms${userInfo}`,
      );
    });

    next();
  }

  private shouldLogBody(method: string, url: string): boolean {
    const normalizedMethod = method.toUpperCase();
    const normalizedPath = url.split('?')[0].toLowerCase();
    const methodsWithBody = ['POST', 'PUT', 'PATCH', 'DELETE'];

    return (
      methodsWithBody.includes(normalizedMethod) &&
      normalizedPath !== '/auth/login'
    );
  }

  private serializeBody(body: Request['body']): string {
    if (body === undefined) {
      return 'undefined';
    }

    try {
      return JSON.stringify(body);
    } catch {
      return '[unserializable-body]';
    }
  }
}
