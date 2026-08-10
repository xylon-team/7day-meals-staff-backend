import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

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
    });
  }

  async findOne(id: number) {
    const order = await this.prisma.customer_order.findUnique({
      where: { order_id: id },
    });
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }
}
