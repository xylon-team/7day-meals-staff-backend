import { Controller, Post, Get, Patch, Delete, Param, Body, UseGuards, ParseIntPipe, Query } from '@nestjs/common';
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
  findAll(
    @Query('item_name') itemName?: string,
    @Query('ingredient_list') ingredientList?: string | string[],
    @Query('is_available') isAvailable?: string,
    @Query('min_price') minPrice?: string,
    @Query('max_price') maxPrice?: string,
  ) {
    const normalizedIngredientList = ingredientList
      ? Array.isArray(ingredientList) ? ingredientList : [ingredientList]
      : undefined;
    
    return this.foodItemService.findAll({
      itemName: itemName || undefined,
      ingredientList: normalizedIngredientList,
      isAvailable: isAvailable === 'true' ? true : isAvailable === 'false' ? false : undefined,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    });
  }

  @Get(':id')
  @RequirePermissions('meal_item_view')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.foodItemService.findOne(id);
  }

  @Get('available/all')
  @RequirePermissions('meal_item_view')
  findAllAvailable() {
    return this.foodItemService.findAllAvailable();
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
