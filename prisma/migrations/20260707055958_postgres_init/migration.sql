-- CreateTable
CREATE TABLE "customer" (
    "customer_id" SERIAL NOT NULL,
    "fname" TEXT NOT NULL,
    "lname" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "latitude" DECIMAL(65,30),
    "longitude" DECIMAL(65,30),
    "address_line_1" TEXT,
    "address_line_2" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "delete_timestamp" TIMESTAMP(3),
    "registration_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_pkey" PRIMARY KEY ("customer_id")
);

-- CreateTable
CREATE TABLE "customer_credential" (
    "customer_credential_id" SERIAL NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "customer_password" TEXT NOT NULL,

    CONSTRAINT "customer_credential_pkey" PRIMARY KEY ("customer_credential_id")
);

-- CreateTable
CREATE TABLE "meal_plan" (
    "meal_id" SERIAL NOT NULL,
    "item_name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "dietary_preference" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "image_path" TEXT,
    "is_available" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "meal_plan_pkey" PRIMARY KEY ("meal_id")
);

-- CreateTable
CREATE TABLE "food_item" (
    "food_item_id" SERIAL NOT NULL,
    "item_name" TEXT NOT NULL,
    "ingredient_list" TEXT NOT NULL,
    "image_path" TEXT,

    CONSTRAINT "food_item_pkey" PRIMARY KEY ("food_item_id")
);

-- CreateTable
CREATE TABLE "meal_plan_food_item" (
    "meal_id" INTEGER NOT NULL,
    "food_item_id" INTEGER NOT NULL,
    "day" TEXT NOT NULL,
    "meal_type" TEXT NOT NULL,

    CONSTRAINT "meal_plan_food_item_pkey" PRIMARY KEY ("meal_id","food_item_id")
);

-- CreateTable
CREATE TABLE "delivery_person" (
    "delivery_person_id" SERIAL NOT NULL,
    "rider_name" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,

    CONSTRAINT "delivery_person_pkey" PRIMARY KEY ("delivery_person_id")
);

-- CreateTable
CREATE TABLE "customer_order" (
    "order_id" SERIAL NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "meal_id" INTEGER NOT NULL,
    "order_timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "delivery_person_id" INTEGER,
    "order_status" TEXT NOT NULL,
    "payment_status" TEXT NOT NULL,
    "delivery_status" TEXT NOT NULL,
    "delivery_preferred_date" TIMESTAMP(3) NOT NULL,
    "is_a_subscribed_meal" BOOLEAN NOT NULL DEFAULT false,
    "offer_id" INTEGER,

    CONSTRAINT "customer_order_pkey" PRIMARY KEY ("order_id")
);

-- CreateTable
CREATE TABLE "subscription" (
    "subscription_id" SERIAL NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "meal_id" INTEGER NOT NULL,
    "subscribe_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "canceled_date" TIMESTAMP(3),
    "delivery_preferred_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_pkey" PRIMARY KEY ("subscription_id")
);

-- CreateTable
CREATE TABLE "delivery_feedback" (
    "feedback_id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "rating_value" INTEGER NOT NULL,
    "description" TEXT,
    "image_path" TEXT,
    "reply" TEXT,
    "replied_date" TIMESTAMP(3),

    CONSTRAINT "delivery_feedback_pkey" PRIMARY KEY ("feedback_id")
);

-- CreateTable
CREATE TABLE "offer" (
    "offer_id" SERIAL NOT NULL,
    "coupon_number" TEXT NOT NULL,
    "expiry_date" TIMESTAMP(3) NOT NULL,
    "usage_limit" INTEGER NOT NULL,
    "min_order_value" DECIMAL(65,30) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "offer_pkey" PRIMARY KEY ("offer_id")
);

-- CreateTable
CREATE TABLE "complaint" (
    "complaint_id" SERIAL NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "date_submitted" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolution_note" TEXT,
    "resolved_date" TIMESTAMP(3),
    "is_resolved" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "complaint_pkey" PRIMARY KEY ("complaint_id")
);

-- CreateTable
CREATE TABLE "staff" (
    "staff_id" SERIAL NOT NULL,
    "fname" TEXT NOT NULL,
    "lname" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "staff_pkey" PRIMARY KEY ("staff_id")
);

-- CreateTable
CREATE TABLE "staff_credential" (
    "staff_credential_id" SERIAL NOT NULL,
    "staff_id" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "staff_password" TEXT NOT NULL,

    CONSTRAINT "staff_credential_pkey" PRIMARY KEY ("staff_credential_id")
);

-- CreateTable
CREATE TABLE "role" (
    "role_id" SERIAL NOT NULL,
    "role" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "role_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "permission" (
    "permission_id" SERIAL NOT NULL,
    "permission_type" TEXT NOT NULL,

    CONSTRAINT "permission_pkey" PRIMARY KEY ("permission_id")
);

-- CreateTable
CREATE TABLE "staff_role" (
    "staff_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,

    CONSTRAINT "staff_role_pkey" PRIMARY KEY ("staff_id","role_id")
);

-- CreateTable
CREATE TABLE "role_permission" (
    "role_id" INTEGER NOT NULL,
    "permission_id" INTEGER NOT NULL,

    CONSTRAINT "role_permission_pkey" PRIMARY KEY ("role_id","permission_id")
);

-- CreateTable
CREATE TABLE "supplier" (
    "supplier_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "agent_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "address_line_1" TEXT,
    "address_line_2" TEXT,
    "address_line_3" TEXT,

    CONSTRAINT "supplier_pkey" PRIMARY KEY ("supplier_id")
);

-- CreateTable
CREATE TABLE "inventory_item" (
    "inventory_id" SERIAL NOT NULL,
    "ingredient_name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "current_quantity" INTEGER NOT NULL,
    "normal_stock_level" INTEGER NOT NULL,
    "low_stock_level" INTEGER NOT NULL,
    "is_out_of_stock" BOOLEAN NOT NULL DEFAULT false,
    "expiry_date" TIMESTAMP(3),
    "unit_price" DECIMAL(65,30) NOT NULL,
    "updated_timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_item_pkey" PRIMARY KEY ("inventory_id")
);

-- CreateTable
CREATE TABLE "supplier_inventory_item" (
    "supplier_id" INTEGER NOT NULL,
    "inventory_id" INTEGER NOT NULL,
    "is_available" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "supplier_inventory_item_pkey" PRIMARY KEY ("supplier_id","inventory_id")
);

-- CreateTable
CREATE TABLE "stock_adjustment" (
    "stock_adjust_id" SERIAL NOT NULL,
    "inventory_id" INTEGER NOT NULL,
    "staff_id" INTEGER NOT NULL,
    "adjustment_type" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "batch_number" TEXT,
    "expiry_date" TIMESTAMP(3),
    "entered_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "remarks" TEXT,

    CONSTRAINT "stock_adjustment_pkey" PRIMARY KEY ("stock_adjust_id")
);

-- CreateTable
CREATE TABLE "supplier_request" (
    "supplier_req_id" SERIAL NOT NULL,
    "supplier_id" INTEGER NOT NULL,
    "inventory_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "requested_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "required_date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "remarks" TEXT,
    "staff_id" INTEGER NOT NULL,

    CONSTRAINT "supplier_request_pkey" PRIMARY KEY ("supplier_req_id")
);

-- CreateTable
CREATE TABLE "setting" (
    "setting_id" SERIAL NOT NULL,
    "delivery_radius" INTEGER NOT NULL,
    "latitude" DECIMAL(65,30) NOT NULL,
    "longitude" DECIMAL(65,30) NOT NULL,
    "delivery_fee" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "setting_pkey" PRIMARY KEY ("setting_id")
);

-- CreateTable
CREATE TABLE "purchase_order" (
    "po_id" SERIAL NOT NULL,
    "supplier_id" INTEGER NOT NULL,
    "item_count" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,

    CONSTRAINT "purchase_order_pkey" PRIMARY KEY ("po_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customer_credential_customer_id_key" ON "customer_credential"("customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "offer_coupon_number_key" ON "offer"("coupon_number");

-- CreateIndex
CREATE UNIQUE INDEX "staff_credential_staff_id_key" ON "staff_credential"("staff_id");

-- AddForeignKey
ALTER TABLE "customer_credential" ADD CONSTRAINT "customer_credential_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("customer_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_plan_food_item" ADD CONSTRAINT "meal_plan_food_item_meal_id_fkey" FOREIGN KEY ("meal_id") REFERENCES "meal_plan"("meal_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_plan_food_item" ADD CONSTRAINT "meal_plan_food_item_food_item_id_fkey" FOREIGN KEY ("food_item_id") REFERENCES "food_item"("food_item_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_order" ADD CONSTRAINT "customer_order_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("customer_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_order" ADD CONSTRAINT "customer_order_meal_id_fkey" FOREIGN KEY ("meal_id") REFERENCES "meal_plan"("meal_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_order" ADD CONSTRAINT "customer_order_delivery_person_id_fkey" FOREIGN KEY ("delivery_person_id") REFERENCES "delivery_person"("delivery_person_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_order" ADD CONSTRAINT "customer_order_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "offer"("offer_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("customer_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_meal_id_fkey" FOREIGN KEY ("meal_id") REFERENCES "meal_plan"("meal_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_feedback" ADD CONSTRAINT "delivery_feedback_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "customer_order"("order_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaint" ADD CONSTRAINT "complaint_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("customer_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_credential" ADD CONSTRAINT "staff_credential_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("staff_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_role" ADD CONSTRAINT "staff_role_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("staff_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_role" ADD CONSTRAINT "staff_role_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("role_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("role_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permission"("permission_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_inventory_item" ADD CONSTRAINT "supplier_inventory_item_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "supplier"("supplier_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_inventory_item" ADD CONSTRAINT "supplier_inventory_item_inventory_id_fkey" FOREIGN KEY ("inventory_id") REFERENCES "inventory_item"("inventory_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_adjustment" ADD CONSTRAINT "stock_adjustment_inventory_id_fkey" FOREIGN KEY ("inventory_id") REFERENCES "inventory_item"("inventory_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_adjustment" ADD CONSTRAINT "stock_adjustment_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("staff_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_request" ADD CONSTRAINT "supplier_request_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "supplier"("supplier_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_request" ADD CONSTRAINT "supplier_request_inventory_id_fkey" FOREIGN KEY ("inventory_id") REFERENCES "inventory_item"("inventory_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_request" ADD CONSTRAINT "supplier_request_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("staff_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order" ADD CONSTRAINT "purchase_order_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "supplier"("supplier_id") ON DELETE RESTRICT ON UPDATE CASCADE;
