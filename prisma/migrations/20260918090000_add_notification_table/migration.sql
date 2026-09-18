-- CreateTable
CREATE TABLE "notification" (
    "notif_id" SERIAL NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_at" TIMESTAMP(3),

    CONSTRAINT "notification_pkey" PRIMARY KEY ("notif_id")
);

-- CreateIndex
CREATE INDEX "notification_customer_id_created_at_idx" ON "notification"("customer_id", "created_at");

-- CreateIndex
CREATE INDEX "notification_customer_id_read_at_idx" ON "notification"("customer_id", "read_at");

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("customer_id") ON DELETE RESTRICT ON UPDATE CASCADE;
