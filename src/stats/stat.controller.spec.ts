import { StatController } from './stat.controller';
import { StatService } from './stat.service';

describe('StatController inventory dashboard', () => {
  it('returns inventory dashboard summary from the service', async () => {
    const summary = {
      total_inventory_items: 8,
      total_suppliers: 3,
      low_stock_items: 2,
      out_of_stock_items: 1,
      pending_supplier_requests: 4,
      recent_inventory_updates: [],
    };
    const service = {
      getAdminDashboardStats: jest.fn(),
      getInventoryDashboardSummary: jest.fn().mockResolvedValue(summary),
    } as unknown as StatService;
    const controller = new StatController(service);

    await expect(controller.getInventoryDashboardSummary()).resolves.toEqual(summary);
    expect(service.getInventoryDashboardSummary).toHaveBeenCalledTimes(1);
  });
});
