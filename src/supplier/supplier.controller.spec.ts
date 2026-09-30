import { SupplierController } from './supplier.controller';
import { SupplierService } from './supplier.service';

describe('SupplierController', () => {
  it('returns supplier records from the service and passes the search term', async () => {
    const suppliers = [{ supplier_id: 1, name: 'Example Supplier' }];
    const service = {
      findAll: jest.fn().mockResolvedValue(suppliers),
    } as unknown as SupplierService;
    const controller = new SupplierController(service);

    await expect(controller.findAll('Lanka')).resolves.toEqual(suppliers);
    expect(service.findAll).toHaveBeenCalledWith('Lanka');
  });

  it('passes an omitted search term to the service', async () => {
    const service = {
      findAll: jest.fn().mockResolvedValue([]),
    } as unknown as SupplierService;
    const controller = new SupplierController(service);

    await expect(controller.findAll()).resolves.toEqual([]);
    expect(service.findAll).toHaveBeenCalledTimes(1);
  });
});
