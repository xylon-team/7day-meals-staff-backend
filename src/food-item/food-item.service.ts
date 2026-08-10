import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFoodItemDto } from './dto/create-food-item.dto';
import { UpdateFoodItemDto } from './dto/update-food-item.dto';

@Injectable()
export class FoodItemService {
  constructor(private prisma: PrismaService) {}

  async create(createFoodItemDto: CreateFoodItemDto) {
    return await this.prisma.food_item.create({
      data: {
        item_name: createFoodItemDto.item_name,
        ingredient_list: createFoodItemDto.ingredient_list,
        image_path: createFoodItemDto.image_path,
        price: createFoodItemDto.price,
        is_available: createFoodItemDto.is_available !== undefined ? createFoodItemDto.is_available : true,
      },
    });
  }

  async findAll() {
    return await this.prisma.food_item.findMany();
  }

  async findAllAvailable() {
    return await this.prisma.food_item.findMany({
      where: { is_available: true },
    });
  }
  
  async findOne(id: number) {
    const foodItem = await this.prisma.food_item.findUnique({
      where: { food_item_id: id },
    });
    if (!foodItem) {
      throw new NotFoundException(`Food item with ID ${id} not found`);
    }
    return foodItem;
  }

  async update(id: number, updateFoodItemDto: UpdateFoodItemDto) {
    await this.findOne(id); // Check if exists
    return await this.prisma.food_item.update({
      where: { food_item_id: id },
      data: {
        item_name: updateFoodItemDto.item_name,
        ingredient_list: updateFoodItemDto.ingredient_list,
        image_path: updateFoodItemDto.image_path,
        price: updateFoodItemDto.price,
        is_available: updateFoodItemDto.is_available,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id); // Check if exists
    return await this.prisma.food_item.delete({
      where: { food_item_id: id },
    });
  }
}
