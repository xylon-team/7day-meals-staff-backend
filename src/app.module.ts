import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CustomerModule } from './customer/customer.module';
import { AdminAuthModule } from './admin-auth/admin-auth.module';
import { StaffAuthModule } from './staff-auth/staff-auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    CustomerModule,
    AdminAuthModule,
    StaffAuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
