import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

// Creates a staff + credential with no roles (therefore no permissions).
// Used for 403 "insufficient permissions" tests.
export async function createNoPermStaff(prisma: PrismaClient, suffix: string) {
  const email = `e2e-noperm-${suffix}@7daymeals.local`;
  const password = 'TestPass1!';
  const hashed = await bcrypt.hash(password, 10);
  const staff = await prisma.staff.create({
    data: {
      fname: 'NoPerm',
      lname: 'Test',
      phone_number: '0000000000',
      status: 'active',
      credential: {
        create: { email, staff_password: hashed },
      },
    },
  });
  return { staffId: staff.staff_id, email, password };
}

// Deletes a staff (cascades to credential and staff_roles via onDelete: Cascade).
export async function cleanupStaff(prisma: PrismaClient, staffId: number) {
  await prisma.staff.delete({ where: { staff_id: staffId } });
}
