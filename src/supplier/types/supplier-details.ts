import { Prisma } from '@prisma/client';

// ============= Standalone Supplier Details =============
export type SupplierDetails = Pick<
  Prisma.supplierCreateInput,
  | 'name'
  | 'agent_name'
  | 'email'
  | 'phone_number'
  | 'address_line_1'
  | 'address_line_2'
  | 'address_line_3'
>;
