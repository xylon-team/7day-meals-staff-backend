/*
  Warnings:

  - Added the required column `price` to the `food_item` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "food_item" ADD COLUMN     "is_available" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "price" DECIMAL(65,30) NOT NULL;
