import { GUARDS_METADATA } from '@nestjs/common/constants';
import { Test, TestingModule } from '@nestjs/testing';
import { AdminJwtAuthGuard } from '../admin-auth/guards/admin-jwt-auth.guard';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';

jest.mock('./dto/update-customer.dto', () => ({
  UpdateCustomerDto: class UpdateCustomerDto {},
}));

describe('CustomerController', () => {
  let controller: CustomerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerController],
      providers: [{ provide: CustomerService, useValue: {} }],
    }).compile();

    controller = module.get<CustomerController>(CustomerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it.each([
    ['create', CustomerController.prototype.create],
    ['update', CustomerController.prototype.update],
    ['remove', CustomerController.prototype.remove],
  ])('requires Admin authentication for customer %s', (_name, handler) => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, handler);
    expect(guards).toContain(AdminJwtAuthGuard);
  });
});
