import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SupplierRequestService } from './supplier-request.service';

describe('SupplierRequestService', () => {
  const supplier = { supplier_id: 3, is_active: true };
  const inventoryItem = { inventory_id: 9 };
  const created = { supplier_req_id: 5, supplier_id: 3, inventory_id: 9, quantity: 12, status: 'pending', staff_id: 4 };
  const prisma = {
    supplier: { findUnique: jest.fn() },
    inventory_item: { findUnique: jest.fn() },
    supplier_request: { create: jest.fn() },
  };
  const service = new SupplierRequestService(prisma as unknown as PrismaService);
  const dto = { supplier_id: 3, inventory_id: 9, quantity: 12, required_date: '2026-10-03T10:00:00.000Z', remarks: 'Please deliver fresh stock' };

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.supplier.findUnique.mockResolvedValue(supplier);
    prisma.inventory_item.findUnique.mockResolvedValue(inventoryItem);
    prisma.supplier_request.create.mockResolvedValue(created);
  });

  it('creates a pending request for an active supplier and records the authenticated staff member', async () => {
    await expect(service.create(dto, 4)).resolves.toEqual(created);
    expect(prisma.supplier_request.create).toHaveBeenCalledWith({
      data: {
        supplier_id: 3,
        inventory_id: 9,
        quantity: 12,
        required_date: new Date(dto.required_date),
        remarks: dto.remarks,
        status: 'pending',
        staff_id: 4,
      },
    });
  });

  it('rejects a deactivated supplier before creating a request', async () => {
    prisma.supplier.findUnique.mockResolvedValue({ ...supplier, is_active: false });

    await expect(service.create(dto, 4)).rejects.toThrow(BadRequestException);
    expect(prisma.supplier_request.create).not.toHaveBeenCalled();
  });

  it('returns not found for an unknown supplier', async () => {
    prisma.supplier.findUnique.mockResolvedValue(null);

    await expect(service.create(dto, 4)).rejects.toThrow(NotFoundException);
    expect(prisma.supplier_request.create).not.toHaveBeenCalled();
  });

  it('returns not found for an unknown inventory item', async () => {
    prisma.inventory_item.findUnique.mockResolvedValue(null);

    await expect(service.create(dto, 4)).rejects.toThrow(NotFoundException);
    expect(prisma.supplier_request.create).not.toHaveBeenCalled();
  });
});
