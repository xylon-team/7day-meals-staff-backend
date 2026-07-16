import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatService {
  private readonly logger = new Logger(StatService.name);

  constructor(private prisma: PrismaService) {}

  //ADMIN DASHBOARD
  async getAdminDashboardStats() {
    const errors: string[] = [];

    //Get total staff count
    let total_staff = 0;
    try {
      total_staff = await this.prisma.staff.count();
    } catch (error) {
      this.logger.error('Failed to fetch total staff count', error);
      errors.push('Failed to fetch total staff count');
    }

    //Get total customers count
    let total_customers = 0;
    try {
      total_customers = await this.prisma.customer.count();
    } catch (error) {
      this.logger.error('Failed to fetch total customers count', error);
      errors.push('Failed to fetch total customers count');
    }

    //Get active orders count
    let active_orders = 0;
    try {
      active_orders = await this.prisma.customer_order.count({
        where: {
          order_status: {
            in: ['pending', 'processing', 'preparing', 'ready'],
          },
        },
      });
    } catch (error) {
      this.logger.error('Failed to fetch active orders count', error);
      errors.push('Failed to fetch active orders count');
    }

    // Get orders from the last 7 days
    const weekly_orders = {
      Sunday: 0,
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
      Saturday: 0,
    };

    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentOrders = await this.prisma.$queryRaw<{ day_name: string; count: bigint }[]>`
        SELECT TO_CHAR(order_timestamp, 'Day') as day_name, COUNT(*) as count
        FROM customer_order
        WHERE order_timestamp >= ${sevenDaysAgo}
        GROUP BY TO_CHAR(order_timestamp, 'Day')
      `;

      recentOrders.forEach((order) => {
        const dayName = order.day_name.trim() as keyof typeof weekly_orders;
        weekly_orders[dayName] = Number(order.count);
      });
    } catch (error) {
      this.logger.error('Failed to fetch weekly orders', error);
      errors.push('Failed to fetch weekly orders');
    }

    // Get orders grouped by meal plan category using raw SQL
    const orders_by_categories: Record<string, number> = {};
    try {
      const ordersByCategory = await this.prisma.$queryRaw<{ category: string; count: bigint }[]>`
        SELECT mp.category, COUNT(*) as count
        FROM customer_order co
        JOIN meal_plan mp ON co.meal_id = mp.meal_id
        GROUP BY mp.category
      `;

      ordersByCategory.forEach((item) => {
        orders_by_categories[item.category] = Number(item.count);
      });
    } catch (error) {
      this.logger.error('Failed to fetch orders by categories', error);
      errors.push('Failed to fetch orders by categories');
    }

    // Get revenue today
    let revenue_today = 0;
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const revenueResult = await this.prisma.$queryRaw<{ total: bigint }[]>`
        SELECT COALESCE(SUM(mp.price), 0) as total
        FROM customer_order co
        JOIN meal_plan mp ON co.meal_id = mp.meal_id
        WHERE co.order_timestamp >= ${today} AND co.order_timestamp < ${tomorrow}
      `;

      revenue_today = Number(revenueResult[0]?.total ?? 0);
    } catch (error) {
      this.logger.error('Failed to fetch revenue today', error);
      errors.push('Failed to fetch revenue today');
    }
    
    return {
      total_staff,
      total_customers,
      active_orders,
      revenue_today,
      weekly_orders,
      orders_by_categories,
      errors,
    };
  }
}
