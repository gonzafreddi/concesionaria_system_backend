import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  const createContext = (request: Record<string, unknown>): ExecutionContext =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    }) as unknown as ExecutionContext;

  it('allows public routes without token', () => {
    const jwtService = { verify: jest.fn() } as unknown as JwtService;
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(true),
    } as unknown as Reflector;
    const guard = new AuthGuard(jwtService, reflector);

    const canActivate = guard.canActivate(
      createContext({ headers: {}, socket: {} }),
    );

    expect(canActivate).toBe(true);
  });

  it('attaches the decoded user for authenticated routes', () => {
    const payload = { id: 1, email: 'admin@test.com', role: 'ADMIN' };
    const jwtService = {
      verify: jest.fn().mockReturnValue(payload),
    } as unknown as JwtService;
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(false),
    } as unknown as Reflector;
    const guard = new AuthGuard(jwtService, reflector);
    const request = {
      headers: { authorization: 'Bearer valid-token' },
      socket: {},
    };

    const canActivate = guard.canActivate(createContext(request));

    expect(canActivate).toBe(true);
    expect(request).toMatchObject({ user: payload });
  });

  it('rejects protected routes without token', () => {
    const jwtService = { verify: jest.fn() } as unknown as JwtService;
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(false),
    } as unknown as Reflector;
    const guard = new AuthGuard(jwtService, reflector);

    expect(() => guard.canActivate(createContext({ headers: {}, socket: {} }))).toThrow(
      UnauthorizedException,
    );
  });
});
