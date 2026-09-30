import { SupplierRequestController } from './supplier-request.controller';
import { SupplierRequestService } from './supplier-request.service';

describe('SupplierRequestController', () => {
  it('passes the request data and authenticated staff ID to the service', async () => {
    const created = { supplier_req_id: 5, status: 'pending' };
    const service = {
      create: jest.fn().mockResolvedValue(created),
    } as unknown as SupplierRequestService;
    const controller = new SupplierRequestController(service);
    const dto = { supplier_id: 3, inventory_id: 9, quantity: 12, required_date: '2026-10-03T10:00:00.000Z' };

    await expect(controller.create(dto, { user: { staffId: 4 } })).resolves.toEqual(created);
    expect(service.create).toHaveBeenCalledWith(dto, 4);
  });
});
