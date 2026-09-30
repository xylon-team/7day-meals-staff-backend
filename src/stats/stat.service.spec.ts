import { PrismaService } from '../prisma/prisma.service';
import { StatService } from './stat.service';

describe('StatService inventory dashboard summary', () => {
  const inventoryStats = {
    total_inventory_items: 12n,
    low_stock_items: 3n,
    out_of_stock_items: 1n,
  };
  const recentUpdates = [
    {
      stock_adjust_id: 8,
      adjustment_type: 'increase',
      quantity: 4,
      entered_date: new Date('2026-09-30T08:00:00Z'),
      remarks: null,
      inventory: { inventory_id: 2, ingredient_name: 'Rice' },
      staff: { fname: 'A', lname: 'B' },
    },
  ];
  const prisma = {
    $queryRaw: jest.fn().mockResolvedValue([inventoryStats]),
    supplier: { count: jest.fn().mockResolvedValue(6) },
    supplier_request: { count: jest.fn().mockResolvedValue(2) },
    stock_adjustment: { findMany: jest.fn().mockResolvedValue(recentUpdates) },
  };
  const service = new StatService(prisma as unknown as PrismaService);

  it('returns inventory, supplier, stock and recent update summaries', async () => {
    await expect(service.getInventoryDashboardSummary()).resolves.toEqual({
      total_inventory_items: 12,
      total_suppliers: 6,
      low_stock_items: 3,
      out_of_stock_items: 1,
      pending_supplier_requests: 2,
      recent_inventory_updates: recentUpdates,
    });
    expect(prisma.supplier_request.count).toHaveBeenCalledWith({
      where: { status: { equals: 'pending', mode: 'insensitive' } },
    });
    expect(prisma.stock_adjustment.findMany).toHaveBeenCalledWith({
      take: 5,
      orderBy: { entered_date: 'desc' },
      select: {
        stock_adjust_id: true,
        adjustment_type: true,
        quantity: true,
        entered_date: true,
        remarks: true,
        inventory: { select: { inventory_id: true, ingredient_name: true } },
        staff: { select: { fname: true, lname: true } },
      },
    });
  });
});
