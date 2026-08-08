import { Controller, Post, Get, Patch, Delete, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { FoodItemService } from './food-item.service';
import { CreateFoodItemDto } from './dto/create-food-item.dto';
import { UpdateFoodItemDto } from './dto/update-food-item.dto';
import { StaffJwtAuthGuard } from '../staff-auth/guards/staff-auth.guard';
import { PermissionsGuard } from '../staff-auth/guards/permissions.guard';
import { RequirePermissions } from '../staff-auth/decorators/permissions.decorator';

@Controller('food-items')
@UseGuards(StaffJwtAuthGuard, PermissionsGuard)
export class FoodItemController {
  constructor(private readonly foodItemService: FoodItemService) {}

  @Post()
  @RequirePermissions('meal_item_add')
  create(@Body() createFoodItemDto: CreateFoodItemDto) {
    return this.foodItemService.create(createFoodItemDto);
  }

  @Get()
  @RequirePermissions('meal_item_view')
  findAll() {
    return this.foodItemService.findAll();
  }

  @Get(':id')
  @RequirePermissions('meal_item_view')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.foodItemService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('meal_item_change')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFoodItemDto: UpdateFoodItemDto,
  ) {
    return this.foodItemService.update(id, updateFoodItemDto);
  }

  @Delete(':id')
  @RequirePermissions('meal_item_delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.foodItemService.remove(id);
  }
}
