import {
  BadRequestException,
  NotImplementedException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  create(createCustomerDto: CreateCustomerDto) {
    throw new NotImplementedException('Customer creation is not implemented');
  }

  // ============= Customer Directory =============
  findAll() {
    // Include all account statuses for auditing, but expose only email from credentials.
    return this.prisma.customer.findMany({
      include: {
        credential: { select: { email: true } },
        _count: { select: { orders: true } },
      },
      orderBy: [{ registration_date: 'desc' }, { customer_id: 'desc' }],
    });
  }

  // ============= Customer Profile =============
  async findOne(id: number) {
    // Validate the positive PostgreSQL Int range before querying Prisma.
    if (!Number.isInteger(id) || id <= 0 || id > 2147483647) {
      throw new BadRequestException(
        'Customer ID must be a positive 32-bit integer',
      );
    }

    // --------------------- Safe Profile Lookup ------------------
    const customer = await this.prisma.customer.findUnique({
      where: { customer_id: id },
      include: { credential: { select: { email: true } } },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return customer;
  }

  async update(id: number, updateCustomerDto: UpdateCustomerDto) {
    if (!Number.isInteger(id) || id <= 0 || id > 2147483647) {
      throw new BadRequestException(
        'Customer ID must be a positive 32-bit integer',
      );
    }
    if (updateCustomerDto.is_active === undefined) {
      throw new BadRequestException('No valid customer fields provided');
    }

    try {
      return await this.prisma.customer.update({
        where: { customer_id: id },
        data: { is_active: updateCustomerDto.is_active },
        select: { customer_id: true, is_active: true },
      });
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'P2025') {
        throw new NotFoundException(`Customer with ID ${id} not found`);
      }
      throw error;
    }
  }

  async deactivate(id: number) {
    const customer = await this.prisma.customer.findUnique({
      where: { customer_id: id },
      select: { customer_id: true },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return this.prisma.customer.update({
      where: { customer_id: id },
      data: { is_active: false },
      select: { customer_id: true, is_active: true },
    });
  }

  remove(id: number) {
    throw new NotImplementedException('Customer deletion is not implemented');
  }
}
