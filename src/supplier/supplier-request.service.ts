import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplierRequestDto } from './dto/create-supplier-request.dto';

@Injectable()
export class SupplierRequestService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSupplierRequestDto, staffId: number) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { supplier_id: dto.supplier_id },
      select: { supplier_id: true, is_active: true },
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${dto.supplier_id} not found`);
    }

    if (!supplier.is_active) {
      throw new BadRequestException('Deactivated suppliers cannot be used for new supply requests');
    }

    const inventoryItem = await this.prisma.inventory_item.findUnique({
      where: { inventory_id: dto.inventory_id },
      select: { inventory_id: true },
    });

    if (!inventoryItem) {
      throw new NotFoundException(`Inventory item with ID ${dto.inventory_id} not found`);
    }

    return this.prisma.supplier_request.create({
      data: {
        supplier_id: dto.supplier_id,
        inventory_id: dto.inventory_id,
        quantity: dto.quantity,
        required_date: new Date(dto.required_date),
        remarks: dto.remarks,
        status: 'pending',
        staff_id: staffId,
      },
    });
  }
}
