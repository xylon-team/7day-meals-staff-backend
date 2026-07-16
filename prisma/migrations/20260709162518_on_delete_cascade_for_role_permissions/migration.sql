-- DropForeignKey
ALTER TABLE "role_permission" DROP CONSTRAINT "role_permission_role_id_fkey";

-- DropForeignKey
ALTER TABLE "staff_role" DROP CONSTRAINT "staff_role_role_id_fkey";

-- AddForeignKey
ALTER TABLE "staff_role" ADD CONSTRAINT "staff_role_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("role_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("role_id") ON DELETE CASCADE ON UPDATE CASCADE;
