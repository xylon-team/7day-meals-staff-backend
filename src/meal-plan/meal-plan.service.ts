import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMealPlanDto } from './dto/create-meal-plan.dto';
import { UpdateMealPlanDto } from './dto/update-meal-plan.dto';
import { CreateMealPlanFoodItemDto } from './dto/create-mp-fi.dto';
import { UpdateMealPlanFoodItemDto } from './dto/update-mp-fi.dto';

@Injectable()
export class MealPlanService {
  constructor(private prisma: PrismaService) {}

  async create(createMealPlanDto: CreateMealPlanDto, foodItems?: CreateMealPlanFoodItemDto[]) {
  return await this.prisma.$transaction(async (tx) => {
    const mealPlan = await tx.meal_plan.create({
      data: {
        item_name: createMealPlanDto.item_name,
        category: createMealPlanDto.category,
        description: createMealPlanDto.description,
        dietary_preference: createMealPlanDto.dietary_preference,
        price: createMealPlanDto.price,
        image_path: createMealPlanDto.image_path,
        is_available: createMealPlanDto.is_available !== undefined ? createMealPlanDto.is_available : true,
      },
    });

    if (foodItems && foodItems.length > 0) {
      const foodItemIds = foodItems.map((item) => item.food_item_id);
      const existingFoodItems = await tx.food_item.findMany({
        where: { food_item_id: { in: foodItemIds } },
        select: { food_item_id: true },
      });

      const existingIds = new Set(existingFoodItems.map((fi) => fi.food_item_id));
      const missingIds = foodItemIds.filter((id) => !existingIds.has(id));

      if (missingIds.length > 0) {
        throw new BadRequestException(`Food items with IDs ${missingIds.join(', ')} not found`);
      }

      await tx.meal_plan_food_item.createMany({
        data: foodItems.map((item) => ({
          meal_id: mealPlan.meal_id,
          food_item_id: item.food_item_id,
          day: item.day,
          meal_type: item.meal_type,
        })),
      }).catch((error) => {
        if (error.code === 'P2002') {
          throw new ConflictException('Duplicate food item entry in meal plan');
        }       
        throw error;
      });
    }
    return await tx.meal_plan.findUnique({
      where: { meal_id: mealPlan.meal_id },
      include: {
        food_items: {
          include: {
            food_item: true,
          },
        },
      },
    });
  });
}

  async findAll() {
    return await this.prisma.meal_plan.findMany({
      include: {
        food_items: {
          include: {
            food_item: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const mealPlan = await this.prisma.meal_plan.findUnique({
      where: { meal_id: id },
      include: {
        food_items: {
          include: {
            food_item: true,
          },
        },
      },
    });
    if (!mealPlan) {
      throw new NotFoundException(`Meal plan with ID ${id} not found`);
    }
    return mealPlan;
  }

  async update(id: number, updateMealPlanDto: UpdateMealPlanDto, foodItems?: CreateMealPlanFoodItemDto[]) {
    return await this.prisma.$transaction(async (tx) => {
      // Check if meal plan exists
      const existingMealPlan = await tx.meal_plan.findUnique({
        where: { meal_id: id },
      });

      if (!existingMealPlan) {
        throw new NotFoundException(`Meal plan with ID ${id} not found`);
      }

      // Update the meal plan
      const updatedMealPlan = await tx.meal_plan.update({
        where: { meal_id: id },
        data: {
          item_name: updateMealPlanDto.item_name,
          category: updateMealPlanDto.category,
          description: updateMealPlanDto.description,
          dietary_preference: updateMealPlanDto.dietary_preference,
          price: updateMealPlanDto.price,
          image_path: updateMealPlanDto.image_path,
          is_available: updateMealPlanDto.is_available,
        },
      });

      // Update food items if provided
      if (foodItems !== undefined) {
        // Delete existing food item associations
        await tx.meal_plan_food_item.deleteMany({
          where: { meal_id: id },
        });

        // If foodItems array is not empty, create new associations
        if (foodItems.length > 0) {
          // Validate that all food items exist
          const foodItemIds = foodItems.map((item) => item.food_item_id);
          const existingFoodItems = await tx.food_item.findMany({
            where: { food_item_id: { in: foodItemIds } },
            select: { food_item_id: true },
          });

          const existingIds = new Set(existingFoodItems.map((fi) => fi.food_item_id));
          const missingIds = foodItemIds.filter((fid) => !existingIds.has(fid));

          if (missingIds.length > 0) {
            throw new BadRequestException(`Food items with IDs ${missingIds.join(', ')} not found`);
          }

          // Create new food item associations
          await tx.meal_plan_food_item.createMany({
            data: foodItems.map((item) => ({
              meal_id: id,
              food_item_id: item.food_item_id,
              day: item.day,
              meal_type: item.meal_type,
            })),
          }).catch((error) => {
            if (error.code === 'P2002') {
              throw new ConflictException('Duplicate food item entry in meal plan');
            }
            throw error;
          });
        }
      }

      return await tx.meal_plan.findUnique({
        where: { meal_id: id },
        include: {
          food_items: {
            include: {
              food_item: true,
            },
          },
        },
      });
    });
  }

  async deactivate(id: number) {
    await this.findOne(id); // Check if exists and throws NotFoundException if not

    return await this.prisma.meal_plan.update({
      where: { meal_id: id },
      data: {
        is_available: false,
      },
    });
  }

  async updateStatus(id: number, isAvailable: boolean) {
    await this.findOne(id); // Check if exists and throws NotFoundException if not

    return await this.prisma.meal_plan.update({
      where: { meal_id: id },
      data: {
        is_available: isAvailable,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id); // Check if exists and throws NotFoundException if not

    return await this.prisma.$transaction(async (tx) => {
      // First delete meal_plan_food_item associations
      await tx.meal_plan_food_item.deleteMany({
        where: { meal_id: id },
      });

      // Attempt to delete meal plan (will throw error if linked to orders/subscriptions)
      try {
        return await tx.meal_plan.delete({
          where: { meal_id: id },
        });
      } catch (error: any) {
        if (error.code === 'P2003') {
          throw new ConflictException('Cannot delete meal plan because it is linked to existing orders or subscriptions');
        }
        throw error;
      }
    });
  }
}
