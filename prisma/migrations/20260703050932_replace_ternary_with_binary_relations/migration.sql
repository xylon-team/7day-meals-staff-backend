/*
  Warnings:

  - You are about to drop the `staff_role_permission` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `staff_role_permission` DROP FOREIGN KEY `staff_role_permission_permission_id_fkey`;

-- DropForeignKey
ALTER TABLE `staff_role_permission` DROP FOREIGN KEY `staff_role_permission_role_id_fkey`;

-- DropForeignKey
ALTER TABLE `staff_role_permission` DROP FOREIGN KEY `staff_role_permission_staff_id_fkey`;

-- DropTable
DROP TABLE `staff_role_permission`;

-- CreateTable
CREATE TABLE `staff_role` (
    `staff_id` INTEGER NOT NULL,
    `role_id` INTEGER NOT NULL,

    PRIMARY KEY (`staff_id`, `role_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role_permission` (
    `role_id` INTEGER NOT NULL,
    `permission_id` INTEGER NOT NULL,

    PRIMARY KEY (`role_id`, `permission_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `staff_role` ADD CONSTRAINT `staff_role_staff_id_fkey` FOREIGN KEY (`staff_id`) REFERENCES `staff`(`staff_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `staff_role` ADD CONSTRAINT `staff_role_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `role`(`role_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permission` ADD CONSTRAINT `role_permission_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `role`(`role_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permission` ADD CONSTRAINT `role_permission_permission_id_fkey` FOREIGN KEY (`permission_id`) REFERENCES `permission`(`permission_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
