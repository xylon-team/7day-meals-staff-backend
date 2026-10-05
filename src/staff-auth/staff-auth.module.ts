import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StaffAuthService } from './staff-auth.service';
import { StaffAuthController } from './staff-auth.controller';
import { StaffJwtStrategy } from './strategies/staff-auth.strategy';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminAuthModule } from '../admin-auth/admin-auth.module';
import { AdminJwtAuthGuard } from '../admin-auth/guards/admin-jwt-auth.guard';
import { StaffJwtAuthGuard } from './guards/staff-auth.guard';
import { AdminOrStaffAuthGuard } from './guards/admin-or-staff-auth.guard';

@Module({
  imports: [
    PrismaModule,
    AdminAuthModule,
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '1d',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [StaffAuthController],
  providers: [
    StaffAuthService,
    StaffJwtStrategy,
    AdminJwtAuthGuard,
    StaffJwtAuthGuard,
    AdminOrStaffAuthGuard,
  ],
  exports: [StaffAuthService, AdminOrStaffAuthGuard],
})
export class StaffAuthModule {}
