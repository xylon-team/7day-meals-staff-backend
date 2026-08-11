/*
  Warnings:

  - The primary key for the `meal_plan_food_item` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "meal_plan_food_item" DROP CONSTRAINT "meal_plan_food_item_pkey",
ADD CONSTRAINT "meal_plan_food_item_pkey" PRIMARY KEY ("meal_id", "food_item_id", "day", "meal_type");
