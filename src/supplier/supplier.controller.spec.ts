import { SupplierController } from './supplier.controller';
import { SupplierService } from './supplier.service';

describe('SupplierController', () => {
  it('returns supplier records from the service', async () => {
    const suppliers = [{ supplier_id: 1, name: 'Example Supplier' }];
    const service = {
      findAll: jest.fn().mockResolvedValue(suppliers),
    } as unknown as SupplierService;
    const controller = new SupplierController(service);

    await expect(controller.findAll()).resolves.toEqual(suppliers);
    expect(service.findAll).toHaveBeenCalledTimes(1);
  });
});
