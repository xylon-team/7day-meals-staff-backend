import { PrismaService } from '../prisma/prisma.service';
import { SupplierService } from './supplier.service';

describe('SupplierService', () => {
  let prisma: { supplier: { findMany: jest.Mock } };
  let service: SupplierService;

  beforeEach(() => {
    prisma = { supplier: { findMany: jest.fn().mockResolvedValue([]) } };
    service = new SupplierService(prisma as unknown as PrismaService);
  });

  it('returns supplier records ordered by ID', async () => {
    await expect(service.findAll()).resolves.toEqual([]);
    expect(prisma.supplier.findMany).toHaveBeenCalledWith({
      orderBy: { supplier_id: 'asc' },
    });
  });
});
