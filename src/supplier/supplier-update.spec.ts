import {
  BadRequestException,
  NotFoundException,
  ValidationPipe,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SupplierService } from './supplier.service';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

describe('Supplier update validation', () => {
  const pipe = new ValidationPipe({ whitelist: true, transform: true });
  const validate = (value: unknown) =>
    pipe.transform(value, {
      type: 'body',
      metatype: UpdateSupplierDto,
    });

  it('trims partial contact updates and removes protected fields', async () => {
    await expect(
      validate({ name: '  New supplier  ', supplier_id: 8, is_active: false }),
    ).resolves.toEqual({ name: 'New supplier' });
  });

  it.each([
    { name: '   ' },
    { name: null },
    { agent_name: null },
    { email: 'invalid' },
    { phone_number: '' },
    { phone_number: 123 },
    { inventory_items: null },
    { inventory_items: {} },
    { inventory_items: [null] },
    { inventory_items: [{}] },
    { inventory_items: [{ inventory_id: 0 }] },
    { inventory_items: [{ inventory_id: 1.5 }] },
    { inventory_items: [{ inventory_id: '1' }] },
    { inventory_items: [{ inventory_id: 1, is_available: null }] },
    { inventory_items: [{ inventory_id: 1, is_available: 'true' }] },
    { inventory_items: [{ inventory_id: 1 }, { inventory_id: 1 }] },
  ])('rejects invalid payload %j', async (payload) => {
    await expect(validate(payload)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('allows nullable address fields and an empty item list', async () => {
    await expect(
      validate({ address_line_1: null, inventory_items: [] }),
    ).resolves.toEqual({ address_line_1: null, inventory_items: [] });
  });
});

describe('Supplier update persistence', () => {
  const result = { supplier_id: 1, name: 'Updated', inventory_items: [] };
  let service: SupplierService;
  let tx: {
    supplier: { findUnique: jest.Mock; update: jest.Mock };
    inventory_item: { findMany: jest.Mock };
  };
  beforeEach(() => {
    tx = {
      supplier: {
        findUnique: jest.fn().mockResolvedValue({ supplier_id: 1 }),
        update: jest.fn().mockResolvedValue(result),
      },
      inventory_item: {
        findMany: jest.fn().mockResolvedValue([{ inventory_id: 2 }]),
      },
    };
    service = new SupplierService({
      $transaction: jest.fn((work: (client: typeof tx) => unknown) => work(tx)),
    } as unknown as PrismaService);
  });

  it('persists contact changes without altering item links', async () => {
    await expect(service.update(1, { name: 'Updated' })).resolves.toEqual(
      result,
    );
    expect(tx.inventory_item.findMany).not.toHaveBeenCalled();
    const data = tx.supplier.update.mock.calls[0][0].data;
    expect(data.name).toBe('Updated');
    expect(data.email).toBeUndefined();
    expect(data.inventory_items).toBeUndefined();
  });

  it('replaces supplied items together with contact changes', async () => {
    await service.update(1, {
      name: 'Updated',
      inventory_items: [{ inventory_id: 2, is_available: false }],
    });
    expect(tx.supplier.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: 'Updated',
          inventory_items: {
            deleteMany: {},
            create: [{ inventory_id: 2, is_available: false }],
          },
        }),
      }),
    );
  });

  it('defaults supplied item availability to true', async () => {
    await service.update(1, { inventory_items: [{ inventory_id: 2 }] });
    expect(
      tx.supplier.update.mock.calls[0][0].data.inventory_items.create,
    ).toEqual([{ inventory_id: 2, is_available: true }]);
  });

  it('clears supplied items when explicitly passed an empty list', async () => {
    await service.update(1, { inventory_items: [] });
    expect(tx.supplier.update.mock.calls[0][0].data.inventory_items).toEqual({
      deleteMany: {},
      create: [],
    });
  });

  it('rejects unknown inventory references before writing', async () => {
    await expect(
      service.update(1, {
        name: 'Updated',
        inventory_items: [{ inventory_id: 3 }],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(tx.supplier.update).not.toHaveBeenCalled();
  });

  it('returns 404 for a missing supplier', async () => {
    tx.supplier.findUnique.mockResolvedValue(null);
    await expect(service.update(1, { name: 'Updated' })).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(tx.supplier.update).not.toHaveBeenCalled();
  });

  it.each([0, -1, 1.5])('rejects invalid supplier ID %s', async (id) => {
    await expect(
      service.update(id, { name: 'Updated' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(tx.supplier.update).not.toHaveBeenCalled();
  });

  it('rejects empty updates', async () => {
    await expect(service.update(1, {})).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it.each(['P2025', 'P2003'])(
    'maps concurrent deletion error %s',
    async (code) => {
      tx.supplier.update.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Deleted', {
          code,
          clientVersion: '5.22.0',
        }),
      );
      await expect(
        service.update(1, { name: 'Updated' }),
      ).rejects.toBeInstanceOf(
        code === 'P2025' ? NotFoundException : BadRequestException,
      );
    },
  );
});
