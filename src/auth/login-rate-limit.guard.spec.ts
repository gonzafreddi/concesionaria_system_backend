import { HttpException, HttpStatus } from '@nestjs/common';
import { LoginRateLimitGuard } from './login-rate-limit.guard';

describe('LoginRateLimitGuard', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      LOGIN_RATE_LIMIT_MAX: '2',
      LOGIN_RATE_LIMIT_WINDOW_MS: '1000',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.useRealTimers();
  });

  function createContext(email = 'Admin@Test.com') {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          ip: '127.0.0.1',
          headers: {},
          body: { email },
        }),
      }),
    } as any;
  }

  it('allows attempts within the configured window', () => {
    const guard = new LoginRateLimitGuard();

    expect(guard.canActivate(createContext())).toBe(true);
    expect(guard.canActivate(createContext())).toBe(true);
  });

  it('rejects attempts over the configured limit', () => {
    const guard = new LoginRateLimitGuard();

    guard.canActivate(createContext());
    guard.canActivate(createContext());

    expect(() => guard.canActivate(createContext())).toThrow(HttpException);

    try {
      guard.canActivate(createContext());
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect((error as HttpException).getStatus()).toBe(
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  });

  it('creates independent buckets per normalized email', () => {
    const guard = new LoginRateLimitGuard();

    guard.canActivate(createContext('one@test.com'));
    guard.canActivate(createContext('one@test.com'));

    expect(guard.canActivate(createContext('two@test.com'))).toBe(true);
  });
});
