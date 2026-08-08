import { Module } from '@nestjs/common';
import { FoodItemService } from './food-item.service';
import { FoodItemController } from './food-item.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FoodItemController],
  providers: [FoodItemService],
  exports: [FoodItemService],
})
export class FoodItemModule {}
