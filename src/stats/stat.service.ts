import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InventoryDashboardDto } from './dto/inventory-dashboard-response.dto';

@Injectable()
export class StatService {
  private readonly logger = new Logger(StatService.name);

  constructor(private prisma: PrismaService) {}

  //ADMIN DASHBOARD
  async getAdminDashboardStats() {
    const errors: string[] = [];
    const safeQuery = async <T>(
      message: string,
      fallback: T,
      query: () => Promise<T>,
    ): Promise<T> => {
      try {
        return await query();
      } catch (error) {
        this.logger.error(message, error);
        errors.push(message);
        return fallback;
      }
    };

    const weekly_orders = {
      Sunday: 0,
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
      Saturday: 0,
    };

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [total_staff, total_customers, active_orders, recentOrders, ordersByCategory, revenueResult] =
      await Promise.all([
        safeQuery('Failed to fetch total staff count', 0, () =>
          this.prisma.staff.count(),
        ),
        safeQuery('Failed to fetch total customers count', 0, () =>
          this.prisma.customer.count(),
        ),
        safeQuery('Failed to fetch active orders count', 0, () =>
          this.prisma.customer_order.count({
            where: {
              order_status: {
                in: ['pending', 'processing', 'preparing', 'ready'],
              },
            },
          }),
        ),
        safeQuery('Failed to fetch weekly orders', [], () =>
          this.prisma.$queryRaw<{ day_name: string; count: bigint }[]>`
        SELECT TO_CHAR(order_timestamp, 'Day') as day_name, COUNT(*) as count
        FROM customer_order
        WHERE order_timestamp >= ${sevenDaysAgo}
        GROUP BY TO_CHAR(order_timestamp, 'Day')
      `,
        ),
        safeQuery('Failed to fetch orders by categories', [], () =>
          this.prisma.$queryRaw<{ category: string; count: bigint }[]>`
        SELECT mp.category, COUNT(*) as count
        FROM customer_order co
        JOIN meal_plan mp ON co.meal_id = mp.meal_id
        GROUP BY mp.category
      `,
        ),
        safeQuery('Failed to fetch revenue today', 0, async () => {
          const result = await this.prisma.$queryRaw<{ total: bigint }[]>`
        SELECT COALESCE(SUM(mp.price), 0) as total
        FROM customer_order co
        JOIN meal_plan mp ON co.meal_id = mp.meal_id
        WHERE co.order_timestamp >= ${today} AND co.order_timestamp < ${tomorrow}
      `;
          return Number(result[0]?.total ?? 0);
        }),
      ]);

    recentOrders.forEach((order) => {
      const dayName = order.day_name.trim() as keyof typeof weekly_orders;
      weekly_orders[dayName] = Number(order.count);
    });

    const orders_by_categories: Record<string, number> = {};
    ordersByCategory.forEach((item) => {
      orders_by_categories[item.category] = Number(item.count);
    });

    return {
      total_staff,
      total_customers,
      active_orders,
      revenue_today: revenueResult,
      weekly_orders,
      orders_by_categories,
      errors,
    };
  }

  async getInventoryDashboardSummary(): Promise<InventoryDashboardDto> {
    const [inventoryStats] = await this.prisma.$queryRaw<
      Array<{
        total_inventory_items: bigint;
        low_stock_items: bigint;
        out_of_stock_items: bigint;
      }>
    >`
      SELECT
        COUNT(*) AS total_inventory_items,
        COUNT(*) FILTER (
          WHERE current_quantity <= low_stock_level AND is_out_of_stock = false
        ) AS low_stock_items,
        COUNT(*) FILTER (WHERE is_out_of_stock = true) AS out_of_stock_items
      FROM inventory_item
    `;

    const [total_suppliers, pending_supplier_requests, recent_inventory_updates] =
      await Promise.all([
        this.prisma.supplier.count(),
        this.prisma.supplier_request.count({
          where: { status: { equals: 'pending', mode: 'insensitive' } },
        }),
        this.prisma.stock_adjustment.findMany({
          take: 5,
          orderBy: { entered_date: 'desc' },
          select: {
            stock_adjust_id: true,
            adjustment_type: true,
            quantity: true,
            entered_date: true,
            remarks: true,
            inventory: {
              select: { inventory_id: true, ingredient_name: true },
            },
            staff: { select: { fname: true, lname: true } },
          },
        }),
      ]);

    return {
      total_inventory_items: Number(inventoryStats?.total_inventory_items ?? 0),
      total_suppliers,
      low_stock_items: Number(inventoryStats?.low_stock_items ?? 0),
      out_of_stock_items: Number(inventoryStats?.out_of_stock_items ?? 0),
      pending_supplier_requests,
      recent_inventory_updates,
    };
  }}
