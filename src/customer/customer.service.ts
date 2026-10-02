import {
  BadRequestException,
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
    return 'This action adds a new customer';
  }

  // ============= Customer Directory =============
  findAll() {
    // Include all account statuses for auditing, but expose only email from credentials.
    return this.prisma.customer.findMany({
      include: { credential: { select: { email: true } } },
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

  update(id: number, updateCustomerDto: UpdateCustomerDto) {
    return `This action updates a #${id} customer`;
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
    return `This action removes a #${id} customer`;
  }
}
