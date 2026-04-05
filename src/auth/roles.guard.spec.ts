import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { UserRole } from '../users/entities/user.entity';

describe('RolesGuard', () => {
  const createContext = (request: Record<string, unknown>): ExecutionContext =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    }) as unknown as ExecutionContext;

  it('allows routes without roles metadata', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(undefined),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    const canActivate = guard.canActivate(createContext({}));

    expect(canActivate).toBe(true);
  });

  it('allows users with a required role', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue([UserRole.ADMIN]),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    const canActivate = guard.canActivate(
      createContext({ user: { role: UserRole.ADMIN } }),
    );

    expect(canActivate).toBe(true);
  });

  it('rejects users without the required role', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue([UserRole.ADMIN]),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(() =>
      guard.canActivate(createContext({ user: { role: UserRole.SELLER } })),
    ).toThrow(ForbiddenException);
  });
});
