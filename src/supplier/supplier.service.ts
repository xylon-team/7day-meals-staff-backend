import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SupplierService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(search?: string) {
    const searchTerm = search?.trim();

    return this.prisma.supplier.findMany({
      ...(searchTerm && {
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { agent_name: { contains: searchTerm, mode: 'insensitive' } },
            { email: { contains: searchTerm, mode: 'insensitive' } },
            { phone_number: { contains: searchTerm, mode: 'insensitive' } },
            { address_line_1: { contains: searchTerm, mode: 'insensitive' } },
            { address_line_2: { contains: searchTerm, mode: 'insensitive' } },
            { address_line_3: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
      }),
      orderBy: { supplier_id: 'asc' },
    });
  }

  async deactivate(id: number) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { supplier_id: id },
      select: { supplier_id: true },
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }

    return this.prisma.supplier.update({
      where: { supplier_id: id },
      data: { is_active: false },
      select: { supplier_id: true, is_active: true },
    });
  }
}
