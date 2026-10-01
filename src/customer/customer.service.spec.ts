import { Test, TestingModule } from '@nestjs/testing';
import { CustomerService } from './customer.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CustomerService', () => {
  let service: CustomerService;
  const customer = {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerService,
        {
          provide: PrismaService,
          useValue: { customer },
        },
      ],
    }).compile();

    service = module.get<CustomerService>(CustomerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ============= Customer Directory =============
  it('returns customers of all statuses with a safe credential projection and stable ordering', async () => {
    const records = [
      {
        customer_id: 2,
        is_active: false,
        is_deleted: true,
        credential: { email: 'audit@example.com' },
      },
      { customer_id: 1, is_active: true, is_deleted: false, credential: null },
    ];
    customer.findMany.mockResolvedValue(records);

    expect(await service.findAll()).toEqual(records);
    expect(customer.findMany).toHaveBeenCalledWith({
      include: { credential: { select: { email: true } } },
      orderBy: [{ registration_date: 'desc' }, { customer_id: 'desc' }],
    });
  });

  it('returns an empty directory when no customers exist', async () => {
    customer.findMany.mockResolvedValue([]);
    expect(await service.findAll()).toEqual([]);
  });

  it('propagates database failures instead of returning an empty directory', async () => {
    customer.findMany.mockRejectedValue(new Error('Database unavailable'));
    await expect(service.findAll()).rejects.toThrow('Database unavailable');
  });
});
