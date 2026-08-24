import { Logger } from '@nestjs/common';
import { LoggerMiddleware } from './logger.middleware';

describe('LoggerMiddleware', () => {
  it('logs incoming request metadata and completed request details', () => {
    const middleware = new LoggerMiddleware();
    const next = jest.fn();
    const handlers: Record<string, () => void> = {};
    const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    const req = {
      method: 'POST',
      originalUrl: '/payments',
      ip: '127.0.0.1',
      socket: { remoteAddress: '127.0.0.1' },
      body: {
        saleId: 7,
        amount: 1500,
      },
      user: {
        id: 42,
        email: 'admin@test.com',
        role: 'admin',
      },
    };
    const res = {
      statusCode: 200,
      on: jest.fn((event: string, handler: () => void) => {
        handlers[event] = handler;
        return res;
      }),
    };

    middleware.use(req as any, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('Incoming request POST /payments'),
    );
    expect(logSpy).not.toHaveBeenCalledWith(expect.stringContaining('Body:'));

    handlers.finish();

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('Completed request POST /payments - 200'),
    );
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('User: (id: 42, role: admin)'),
    );
    expect(logSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('admin@test.com'),
    );
    logSpy.mockRestore();
  });

  it('does not log request body for login', () => {
    const middleware = new LoggerMiddleware();
    const next = jest.fn();
    const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    const req = {
      method: 'POST',
      originalUrl: '/auth/login',
      ip: '127.0.0.1',
      socket: { remoteAddress: '127.0.0.1' },
      body: {
        email: 'admin@test.com',
        password: 'secret',
      },
    };
    const res = {
      statusCode: 200,
      on: jest.fn(),
    };

    middleware.use(req as any, res as any, next);

    expect(logSpy).toHaveBeenCalledWith(
      'Incoming request POST /auth/login - IP: 127.0.0.1',
    );
    expect(logSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('password'),
    );
    logSpy.mockRestore();
  });
});
