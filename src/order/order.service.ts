import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  //GET ALL ORDERS (CAN BE FILTERED)
  async findAll(filters: {
    customer_id?: number;
    meal_id?: number;
    delivery_person_id?: number;
    order_status?: string;
    delivery_status?: string;
    is_a_subscribed_meal?: boolean;
    offer_id?: number;
  }) {
    return await this.prisma.customer_order.findMany({
      where: {
        ...(filters.customer_id && { customer_id: filters.customer_id }),
        ...(filters.meal_id && { meal_id: filters.meal_id }),
        ...(filters.delivery_person_id && { delivery_person_id: filters.delivery_person_id }),
        ...(filters.order_status && { order_status: filters.order_status }),
        ...(filters.delivery_status && { delivery_status: filters.delivery_status }),
        ...(filters.is_a_subscribed_meal !== undefined && { is_a_subscribed_meal: filters.is_a_subscribed_meal }),
        ...(filters.offer_id && { offer_id: filters.offer_id }),
      },
      include: {
        customer: { select: { fname: true, lname: true } },
        meal_plan: { select: { item_name: true, price: true } },
      },
    });
  }

  //GET SPECIFIC ORDER
  async findOne(id: number) {
    const order = await this.prisma.customer_order.findUnique({
      where: { order_id: id },
    });
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  //UPDATE ORDER
  async update(id: number, updateOrderDto: UpdateOrderDto) {
    const order = await this.prisma.customer_order.findUnique({
      where: { order_id: id },
    });
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    try {
      return await this.prisma.customer_order.update({
        where: { order_id: id },
        data: updateOrderDto,
        include: {
          customer: { select: { fname: true, lname: true } },
          meal_plan: { select: { item_name: true, price: true } },
        },
      });
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'P2003') {
        throw new BadRequestException('One or more referenced records not found');
      }
      throw error;
    }
  }

  //UPDATE ORDER STATUS
  async updateStatus(id: number, order_status: string) {
    const order = await this.prisma.customer_order.findUnique({
      where: { order_id: id },
    });
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return await this.prisma.customer_order.update({
      where: { order_id: id },
      data: { order_status },
      include: {
        customer: { select: { fname: true, lname: true } },
        meal_plan: { select: { item_name: true, price: true } },
      },
    });
  }

}
