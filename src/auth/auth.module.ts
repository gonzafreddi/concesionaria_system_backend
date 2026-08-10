import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { User } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';
import { RolesGuard } from './roles.guard';
import { getJwtSecret } from '../config/environment';
import { LoginRateLimitGuard } from './login-rate-limit.guard';

/**
 * Módulo de autenticación
 * Configura JWT, provee guardias y servicios de autenticación
 */
@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: getJwtSecret(),
      signOptions: {
        expiresIn: '1d',
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthGuard,
    RolesGuard,
    LoginRateLimitGuard,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  exports: [JwtModule, AuthGuard, AuthService],
})
export class AuthModule {}
