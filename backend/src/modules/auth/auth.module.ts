import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AdminController } from './admin/admin.controller';
import { AdminService } from './admin/admin.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AccessGuard } from './auth_guard/access.guard';
import { JwtAuthGuard } from './auth_guard/auth_guard';
import { RolesGuard } from './auth_guard/guard';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get('JWT_ACCESS_EXPIRES_IN', '15m'),
        },
      }),
    }),
  ],
  controllers: [AuthController, AdminController],
  providers: [
    AuthService,
    AdminService,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    AccessGuard,
  ],
  exports: [
    AuthService,
    AdminService,
    JwtModule,
    JwtAuthGuard,
    AccessGuard,
    RolesGuard,
  ],
})
export class AuthModule {}
