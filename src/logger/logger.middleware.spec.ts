import { Logger } from '@nestjs/common';
import { LoggerMiddleware } from './logger.middleware';

describe('LoggerMiddleware', () => {
  it('logs incoming and completed requests', () => {
    const middleware = new LoggerMiddleware();
    const next = jest.fn();
    const handlers: Record<string, () => void> = {};
    const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    const req = {
      method: 'GET',
      originalUrl: '/clients',
      ip: '127.0.0.1',
      socket: { remoteAddress: '127.0.0.1' },
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

    middleware.use(req as any, res as any, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Incoming request GET /clients'));

    handlers.finish();

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        'Completed request GET /clients - 200',
      ),
    );
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('User: admin@test.com (id: 42, role: admin)'),
    );
    logSpy.mockRestore();
  });
});
