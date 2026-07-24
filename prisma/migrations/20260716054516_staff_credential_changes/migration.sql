/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `staff_credential` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "staff_credential" DROP CONSTRAINT "staff_credential_staff_id_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "staff_credential_email_key" ON "staff_credential"("email");

-- AddForeignKey
ALTER TABLE "staff_credential" ADD CONSTRAINT "staff_credential_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("staff_id") ON DELETE CASCADE ON UPDATE CASCADE;
