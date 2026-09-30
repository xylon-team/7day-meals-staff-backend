import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SupplierController } from './supplier.controller';
import { SupplierService } from './supplier.service';
import { SupplierRequestController } from './supplier-request.controller';
import { SupplierRequestService } from './supplier-request.service';

@Module({
  imports: [PrismaModule],
  controllers: [SupplierController, SupplierRequestController],
  providers: [SupplierService, SupplierRequestService],
  exports: [SupplierService],
})
export class SupplierModule {}
