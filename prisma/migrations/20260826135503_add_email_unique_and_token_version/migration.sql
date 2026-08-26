/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `customer_credential` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "customer_credential" ADD COLUMN     "token_version" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "customer_credential_email_key" ON "customer_credential"("email");
