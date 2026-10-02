import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SupplierDetails } from './types/supplier-details';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SupplierService {
  constructor(private readonly prisma: PrismaService) {}

  // ============= Create Supplier Record =============
  create(details: SupplierDetails) {
    // Save contact details without requiring an inventory assignment.
    return this.prisma.supplier.create({
      data: {
        name: details.name,
        agent_name: details.agent_name,
        email: details.email,
        phone_number: details.phone_number,
        address_line_1: details.address_line_1,
        address_line_2: details.address_line_2,
        address_line_3: details.address_line_3,
      },
    });
  }

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

  // ============= Update Supplier Record =============
  async update(id: number, details: UpdateSupplierDto) {
    if (!Number.isInteger(id) || id < 1) {
      throw new BadRequestException('Supplier ID must be a positive integer');
    }
    // Allow only editable fields so identifiers and status cannot be overwritten.
    const { inventory_items, ...contact } = details;
    const data = {
      name: contact.name,
      agent_name: contact.agent_name,
      email: contact.email,
      phone_number: contact.phone_number,
      address_line_1: contact.address_line_1,
      address_line_2: contact.address_line_2,
      address_line_3: contact.address_line_3,
    };
    if (inventory_items === undefined && Object.values(data).every(value => value === undefined)) {
      throw new BadRequestException('Provide at least one supplier field to update');
    }

    try {
      // --------------------- Atomic Contact and Item Changes ------------------
      return await this.prisma.$transaction(async (tx) => {
        const supplier = await tx.supplier.findUnique({
          where: { supplier_id: id },
          select: { supplier_id: true },
        });
        if (!supplier) {
          throw new NotFoundException(`Supplier with ID ${id} not found`);
        }

        if (inventory_items !== undefined) {
          // Validate every reference before replacing the existing item links.
          const ids = inventory_items.map(item => item.inventory_id);
          const items = await tx.inventory_item.findMany({
            where: { inventory_id: { in: ids } },
            select: { inventory_id: true },
          });
          const found = new Set(items.map(item => item.inventory_id));
          const missing = ids.filter(itemId => !found.has(itemId));
          if (missing.length) {
            throw new BadRequestException(`Inventory items not found: ${missing.join(', ')}`);
          }
        }

        return tx.supplier.update({
          where: { supplier_id: id },
          data: {
            ...data,
            ...(inventory_items !== undefined && {
              inventory_items: {
                deleteMany: {},
                create: inventory_items.map(item => ({
                  inventory_id: item.inventory_id,
                  is_available: item.is_available ?? true,
                })),
              },
            }),
          },
          include: { inventory_items: true },
        });
      });
    } catch (error) {
      // Translate concurrent deletions into useful client errors; transaction rolls back.
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Supplier with ID ${id} not found`);
        }
        if (error.code === 'P2003') {
          throw new BadRequestException('A referenced inventory item no longer exists');
        }
      }
      throw error;
    }
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
