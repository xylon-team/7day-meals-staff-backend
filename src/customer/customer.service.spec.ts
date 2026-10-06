import { Test, TestingModule } from '@nestjs/testing';
import { CustomerService } from './customer.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

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
      include: {
        credential: { select: { email: true } },
        _count: { select: { orders: true } },
      },
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

  // ============= Customer Profile =============
  it('returns a full customer profile with email and audit fields', async () => {
    const profile = {
      customer_id: 1,
      fname: 'Jane',
      lname: 'Doe',
      phone_number: '0771234567',
      address_line_1: '10 Main Street',
      address_line_2: null,
      latitude: null,
      longitude: null,
      registration_date: new Date('2026-01-01T00:00:00Z'),
      is_active: false,
      is_deleted: true,
      is_recovery_requested: true,
      delete_timestamp: new Date('2026-02-01T00:00:00Z'),
      credential: { email: 'jane@example.com' },
    };
    customer.findUnique.mockResolvedValue(profile);
    expect(await service.findOne(1)).toEqual(profile);
    expect(customer.findUnique).toHaveBeenCalledWith({
      where: { customer_id: 1 },
      include: { credential: { select: { email: true } } },
    });
  });

  it('supports a customer without credentials', async () => {
    const profile = { customer_id: 1, credential: null };
    customer.findUnique.mockResolvedValue(profile);
    expect(await service.findOne(1)).toEqual(profile);
  });

  it('throws 404 when the customer does not exist', async () => {
    customer.findUnique.mockResolvedValue(null);
    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
  });

  it.each([0, -1, 1.5, NaN, Infinity, 2147483648])(
    'rejects invalid customer ID %s before querying the database',
    async (id) => {
      await expect(service.findOne(id)).rejects.toThrow(BadRequestException);
      expect(customer.findUnique).not.toHaveBeenCalled();
    },
  );

  it('propagates database failures instead of reporting a missing customer', async () => {
    customer.findUnique.mockRejectedValue(new Error('Database unavailable'));
    await expect(service.findOne(1)).rejects.toThrow('Database unavailable');
  });

  it('updates customer active status and returns the persisted state', async () => {
    customer.update.mockResolvedValue({ customer_id: 1, is_active: true });
    await expect(service.update(1, { is_active: true })).resolves.toEqual({
      customer_id: 1,
      is_active: true,
    });
    expect(customer.update).toHaveBeenCalledWith({
      where: { customer_id: 1 },
      data: { is_active: true },
      select: { customer_id: true, is_active: true },
    });
  });

  it('rejects an empty customer update', async () => {
    await expect(service.update(1, {})).rejects.toThrow(BadRequestException);
    expect(customer.update).not.toHaveBeenCalled();
  });

  it('returns 404 when the customer being updated does not exist', async () => {
    customer.update.mockRejectedValue(Object.assign(new Error('Missing'), { code: 'P2025' }));
    await expect(service.update(1, { is_active: true })).rejects.toThrow(
      NotFoundException,
    );
  });
});
