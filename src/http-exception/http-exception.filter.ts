import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    const message = this.getMessage(exception, exceptionResponse);
    const messageForLog = Array.isArray(message) ? message.join('; ') : message;
    const stack =
      exception instanceof Error ? exception.stack : JSON.stringify(exception);

    this.logger.error(
      `${request.method} ${request.originalUrl || request.url} - ${status} - ${messageForLog}`,
      stack,
    );

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.originalUrl || request.url,
    });
  }

  private getMessage(
    exception: unknown,
    exceptionResponse: string | object | null,
  ): string | string[] {
    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }

    if (
      exceptionResponse &&
      typeof exceptionResponse === 'object' &&
      'message' in exceptionResponse
    ) {
      const { message } = exceptionResponse as { message?: string | string[] };

      if (message) {
        return message;
      }
    }

    if (exception instanceof Error) {
      return exception.message;
    }

    return 'Internal server error';
  }
}
