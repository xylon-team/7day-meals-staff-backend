import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CustomerModule } from './customer/customer.module';
import { AdminAuthModule } from './admin-auth/admin-auth.module';
import { StaffAuthModule } from './staff-auth/staff-auth.module';
import { StaffModule } from './staff/staff.module';
import { SettingModule } from './settings/setting.module';
import { RoleModule } from './role/role.module';
import { StatModule } from './stats/stat.module';
import { FoodItemModule } from './food-item/food-item.module';
import { MealPlanModule } from './meal-plan/meal-plan.module';
import { OrderModule } from './order/order.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    CustomerModule,
    AdminAuthModule,
    StaffAuthModule,
    StaffModule,
    SettingModule,
    RoleModule,
    StatModule,
    FoodItemModule,
    MealPlanModule,
    OrderModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
