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

  it('searches supplier contact and address fields without case sensitivity', async () => {
    await service.findAll('  Lanka  ');

    expect(prisma.supplier.findMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { name: { contains: 'Lanka', mode: 'insensitive' } },
          { agent_name: { contains: 'Lanka', mode: 'insensitive' } },
          { email: { contains: 'Lanka', mode: 'insensitive' } },
          { phone_number: { contains: 'Lanka', mode: 'insensitive' } },
          { address_line_1: { contains: 'Lanka', mode: 'insensitive' } },
          { address_line_2: { contains: 'Lanka', mode: 'insensitive' } },
          { address_line_3: { contains: 'Lanka', mode: 'insensitive' } },
        ],
      },
      orderBy: { supplier_id: 'asc' },
    });
  });

  it('treats a blank search term as an unfiltered supplier list', async () => {
    await service.findAll('   ');

    expect(prisma.supplier.findMany).toHaveBeenCalledWith({
      orderBy: { supplier_id: 'asc' },
    });
  });
});
