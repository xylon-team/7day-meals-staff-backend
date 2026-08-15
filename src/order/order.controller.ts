import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { StaffJwtAuthGuard } from '../staff-auth/guards/staff-auth.guard';
import { PermissionsGuard } from '../staff-auth/guards/permissions.guard';
import { RequirePermissions } from '../staff-auth/decorators/permissions.decorator';

@Controller('order')
@UseGuards(StaffJwtAuthGuard, PermissionsGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  //GET ALL ORDERS ENDPOINT (SUPPORTS FILTERS)
  @Get()
  @RequirePermissions('orders_view')
  findAll(
    @Query('customer_id', new ParseIntPipe({ optional: true })) customer_id?: number,
    @Query('meal_id', new ParseIntPipe({ optional: true })) meal_id?: number,
    @Query('delivery_person_id', new ParseIntPipe({ optional: true })) delivery_person_id?: number,
    @Query('order_status') order_status?: string,
    @Query('delivery_status') delivery_status?: string,
    @Query('is_a_subscribed_meal') is_a_subscribed_meal?: string,
    @Query('offer_id', new ParseIntPipe({ optional: true })) offer_id?: number,
  ) {
    return this.orderService.findAll({
      customer_id,
      meal_id,
      delivery_person_id,
      order_status,
      delivery_status,
      is_a_subscribed_meal: is_a_subscribed_meal === 'true' ? true : is_a_subscribed_meal === 'false' ? false : undefined,
      offer_id,
    });
  }

  //GET ORDER BY ID ENDPOINT
  @Get(':id')
  @RequirePermissions('orders_view')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.findOne(id);
  }

  //UPDATE ORDER ENDPOINT
  @Patch(':id')
  @RequirePermissions('orders_change')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.orderService.update(id, updateOrderDto);
  }

  //UPDATE ORDER STATUS ENDPOINT
  @Patch(':id/status')
  @RequirePermissions('orders_change')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateStatus(id, updateOrderStatusDto.order_status);
  }

}
