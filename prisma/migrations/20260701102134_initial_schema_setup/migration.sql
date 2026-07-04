/*
  Warnings:

  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `user`;

-- CreateTable
CREATE TABLE `customer` (
    `customer_id` INTEGER NOT NULL AUTO_INCREMENT,
    `fname` VARCHAR(100) NOT NULL,
    `lname` VARCHAR(100) NOT NULL,
    `phone_number` VARCHAR(15) NOT NULL,
    `latitude` DECIMAL(10, 8) NULL,
    `longitude` DECIMAL(11, 8) NULL,
    `address_line_1` VARCHAR(100) NULL,
    `address_line_2` VARCHAR(100) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `delete_timestamp` DATETIME(3) NULL,
    `registration_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`customer_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customer_credential` (
    `customer_credential_id` INTEGER NOT NULL AUTO_INCREMENT,
    `customer_id` INTEGER NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `customer_password` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `customer_credential_customer_id_key`(`customer_id`),
    PRIMARY KEY (`customer_credential_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `meal_plan` (
    `meal_id` INTEGER NOT NULL AUTO_INCREMENT,
    `item_name` VARCHAR(100) NOT NULL,
    `category` VARCHAR(100) NOT NULL,
    `description` VARCHAR(1000) NOT NULL,
    `dietary_preference` VARCHAR(100) NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `image_path` VARCHAR(255) NULL,
    `is_available` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`meal_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `food_item` (
    `food_item_id` INTEGER NOT NULL AUTO_INCREMENT,
    `item_name` VARCHAR(100) NOT NULL,
    `ingredient_list` VARCHAR(2000) NOT NULL,
    `image_path` VARCHAR(255) NULL,

    PRIMARY KEY (`food_item_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `meal_plan_food_item` (
    `meal_id` INTEGER NOT NULL,
    `food_item_id` INTEGER NOT NULL,
    `day` VARCHAR(50) NOT NULL,
    `meal_type` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`meal_id`, `food_item_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `delivery_person` (
    `delivery_person_id` INTEGER NOT NULL AUTO_INCREMENT,
    `rider_name` VARCHAR(100) NOT NULL,
    `phone_number` VARCHAR(15) NOT NULL,

    PRIMARY KEY (`delivery_person_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customer_order` (
    `order_id` INTEGER NOT NULL AUTO_INCREMENT,
    `customer_id` INTEGER NOT NULL,
    `meal_id` INTEGER NOT NULL,
    `order_timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `delivery_person_id` INTEGER NULL,
    `order_status` VARCHAR(50) NOT NULL,
    `payment_status` VARCHAR(50) NOT NULL,
    `delivery_status` VARCHAR(50) NOT NULL,
    `delivery_preferred_date` DATETIME(3) NOT NULL,
    `is_a_subscribed_meal` BOOLEAN NOT NULL DEFAULT false,
    `offer_id` INTEGER NULL,

    PRIMARY KEY (`order_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subscription` (
    `subscription_id` INTEGER NOT NULL AUTO_INCREMENT,
    `customer_id` INTEGER NOT NULL,
    `meal_id` INTEGER NOT NULL,
    `subscribe_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `canceled_date` DATETIME(3) NULL,
    `delivery_preferred_date` DATETIME(3) NOT NULL,

    PRIMARY KEY (`subscription_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `delivery_feedback` (
    `feedback_id` INTEGER NOT NULL AUTO_INCREMENT,
    `order_id` INTEGER NOT NULL,
    `rating_value` INTEGER NOT NULL,
    `description` VARCHAR(5000) NULL,
    `image_path` VARCHAR(255) NULL,
    `reply` VARCHAR(5000) NULL,
    `replied_date` DATETIME(3) NULL,

    PRIMARY KEY (`feedback_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `offer` (
    `offer_id` INTEGER NOT NULL AUTO_INCREMENT,
    `coupon_number` VARCHAR(50) NOT NULL,
    `expiry_date` DATETIME(3) NOT NULL,
    `usage_limit` INTEGER NOT NULL,
    `min_order_value` DECIMAL(10, 2) NOT NULL,
    `title` VARCHAR(100) NOT NULL,
    `description` VARCHAR(1000) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `is_enabled` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `offer_coupon_number_key`(`coupon_number`),
    PRIMARY KEY (`offer_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `complaint` (
    `complaint_id` INTEGER NOT NULL AUTO_INCREMENT,
    `customer_id` INTEGER NOT NULL,
    `description` VARCHAR(5000) NOT NULL,
    `date_submitted` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `resolution_note` VARCHAR(1000) NULL,
    `resolved_date` DATETIME(3) NULL,
    `is_resolved` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`complaint_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `staff` (
    `staff_id` INTEGER NOT NULL AUTO_INCREMENT,
    `fname` VARCHAR(100) NOT NULL,
    `lname` VARCHAR(100) NOT NULL,
    `phone_number` VARCHAR(15) NOT NULL,
    `status` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`staff_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `staff_credential` (
    `staff_credential_id` INTEGER NOT NULL AUTO_INCREMENT,
    `staff_id` INTEGER NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `staff_password` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `staff_credential_staff_id_key`(`staff_id`),
    PRIMARY KEY (`staff_credential_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role` (
    `role_id` INTEGER NOT NULL AUTO_INCREMENT,
    `role` VARCHAR(100) NOT NULL,
    `description` VARCHAR(500) NOT NULL,

    PRIMARY KEY (`role_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permission` (
    `permission_id` INTEGER NOT NULL AUTO_INCREMENT,
    `permission_type` VARCHAR(500) NOT NULL,

    PRIMARY KEY (`permission_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `staff_role_permission` (
    `staff_id` INTEGER NOT NULL,
    `role_id` INTEGER NOT NULL,
    `permission_id` INTEGER NOT NULL,

    PRIMARY KEY (`staff_id`, `role_id`, `permission_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `supplier` (
    `supplier_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `agent_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `phone_number` VARCHAR(15) NOT NULL,
    `address_line_1` VARCHAR(200) NULL,
    `address_line_2` VARCHAR(200) NULL,
    `address_line_3` VARCHAR(200) NULL,

    PRIMARY KEY (`supplier_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory_item` (
    `inventory_id` INTEGER NOT NULL AUTO_INCREMENT,
    `ingredient_name` VARCHAR(100) NOT NULL,
    `category` VARCHAR(100) NOT NULL,
    `unit` VARCHAR(50) NOT NULL,
    `current_quantity` INTEGER NOT NULL,
    `normal_stock_level` INTEGER NOT NULL,
    `low_stock_level` INTEGER NOT NULL,
    `is_out_of_stock` BOOLEAN NOT NULL DEFAULT false,
    `expiry_date` DATETIME(3) NULL,
    `unit_price` DECIMAL(10, 2) NOT NULL,
    `updated_timestamp` DATETIME(3) NOT NULL,

    PRIMARY KEY (`inventory_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `supplier_inventory_item` (
    `supplier_id` INTEGER NOT NULL,
    `inventory_id` INTEGER NOT NULL,
    `is_available` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`supplier_id`, `inventory_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stock_adjustment` (
    `stock_adjust_id` INTEGER NOT NULL AUTO_INCREMENT,
    `inventory_id` INTEGER NOT NULL,
    `staff_id` INTEGER NOT NULL,
    `adjustment_type` VARCHAR(100) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `batch_number` VARCHAR(255) NULL,
    `expiry_date` DATETIME(3) NULL,
    `entered_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `remarks` VARCHAR(2000) NULL,

    PRIMARY KEY (`stock_adjust_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `supplier_request` (
    `supplier_req_id` INTEGER NOT NULL AUTO_INCREMENT,
    `supplier_id` INTEGER NOT NULL,
    `inventory_id` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `requested_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `required_date` DATETIME(3) NOT NULL,
    `status` VARCHAR(50) NOT NULL,
    `remarks` VARCHAR(2000) NULL,
    `staff_id` INTEGER NOT NULL,

    PRIMARY KEY (`supplier_req_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `setting` (
    `setting_id` INTEGER NOT NULL AUTO_INCREMENT,
    `delivery_radius` INTEGER NOT NULL,
    `latitude` DECIMAL(10, 8) NOT NULL,
    `longitude` DECIMAL(11, 8) NOT NULL,
    `delivery_fee` DECIMAL(10, 2) NOT NULL,

    PRIMARY KEY (`setting_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `purchase_order` (
    `po_id` INTEGER NOT NULL AUTO_INCREMENT,
    `supplier_id` INTEGER NOT NULL,
    `item_count` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`po_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `customer_credential` ADD CONSTRAINT `customer_credential_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customer`(`customer_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `meal_plan_food_item` ADD CONSTRAINT `meal_plan_food_item_meal_id_fkey` FOREIGN KEY (`meal_id`) REFERENCES `meal_plan`(`meal_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `meal_plan_food_item` ADD CONSTRAINT `meal_plan_food_item_food_item_id_fkey` FOREIGN KEY (`food_item_id`) REFERENCES `food_item`(`food_item_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customer_order` ADD CONSTRAINT `customer_order_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customer`(`customer_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customer_order` ADD CONSTRAINT `customer_order_meal_id_fkey` FOREIGN KEY (`meal_id`) REFERENCES `meal_plan`(`meal_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customer_order` ADD CONSTRAINT `customer_order_delivery_person_id_fkey` FOREIGN KEY (`delivery_person_id`) REFERENCES `delivery_person`(`delivery_person_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customer_order` ADD CONSTRAINT `customer_order_offer_id_fkey` FOREIGN KEY (`offer_id`) REFERENCES `offer`(`offer_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subscription` ADD CONSTRAINT `subscription_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customer`(`customer_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subscription` ADD CONSTRAINT `subscription_meal_id_fkey` FOREIGN KEY (`meal_id`) REFERENCES `meal_plan`(`meal_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `delivery_feedback` ADD CONSTRAINT `delivery_feedback_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `customer_order`(`order_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `complaint` ADD CONSTRAINT `complaint_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customer`(`customer_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `staff_credential` ADD CONSTRAINT `staff_credential_staff_id_fkey` FOREIGN KEY (`staff_id`) REFERENCES `staff`(`staff_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `staff_role_permission` ADD CONSTRAINT `staff_role_permission_staff_id_fkey` FOREIGN KEY (`staff_id`) REFERENCES `staff`(`staff_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `staff_role_permission` ADD CONSTRAINT `staff_role_permission_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `role`(`role_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `staff_role_permission` ADD CONSTRAINT `staff_role_permission_permission_id_fkey` FOREIGN KEY (`permission_id`) REFERENCES `permission`(`permission_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `supplier_inventory_item` ADD CONSTRAINT `supplier_inventory_item_supplier_id_fkey` FOREIGN KEY (`supplier_id`) REFERENCES `supplier`(`supplier_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `supplier_inventory_item` ADD CONSTRAINT `supplier_inventory_item_inventory_id_fkey` FOREIGN KEY (`inventory_id`) REFERENCES `inventory_item`(`inventory_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_adjustment` ADD CONSTRAINT `stock_adjustment_inventory_id_fkey` FOREIGN KEY (`inventory_id`) REFERENCES `inventory_item`(`inventory_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_adjustment` ADD CONSTRAINT `stock_adjustment_staff_id_fkey` FOREIGN KEY (`staff_id`) REFERENCES `staff`(`staff_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `supplier_request` ADD CONSTRAINT `supplier_request_supplier_id_fkey` FOREIGN KEY (`supplier_id`) REFERENCES `supplier`(`supplier_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `supplier_request` ADD CONSTRAINT `supplier_request_inventory_id_fkey` FOREIGN KEY (`inventory_id`) REFERENCES `inventory_item`(`inventory_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `supplier_request` ADD CONSTRAINT `supplier_request_staff_id_fkey` FOREIGN KEY (`staff_id`) REFERENCES `staff`(`staff_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_order` ADD CONSTRAINT `purchase_order_supplier_id_fkey` FOREIGN KEY (`supplier_id`) REFERENCES `supplier`(`supplier_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
