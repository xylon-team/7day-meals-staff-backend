import { SupplierController } from './supplier.controller';
import { SupplierService } from './supplier.service';

describe('SupplierController', () => {
  it('passes the supplier ID and partial update to the service', async () => {
    const supplier = { supplier_id: 7, email: 'new@example.com' };
    const service = {
      update: jest.fn().mockResolvedValue(supplier),
    } as unknown as SupplierService;
    const controller = new SupplierController(service);
    const dto = { email: 'new@example.com' };

    await expect(controller.update(7, dto)).resolves.toEqual(supplier);
    expect(service.update).toHaveBeenCalledWith(7, dto);
  });

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
