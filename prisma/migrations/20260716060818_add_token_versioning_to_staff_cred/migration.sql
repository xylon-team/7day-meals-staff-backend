-- DropForeignKey
ALTER TABLE "staff_role" DROP CONSTRAINT "staff_role_staff_id_fkey";

-- AlterTable
ALTER TABLE "staff_credential" ADD COLUMN     "token_version" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "staff_role" ADD CONSTRAINT "staff_role_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("staff_id") ON DELETE CASCADE ON UPDATE CASCADE;
