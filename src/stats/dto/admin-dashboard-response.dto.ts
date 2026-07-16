import { IsInt, IsNumber, IsObject, IsArray, IsString } from 'class-validator';

export class AdminDashboardDto {
  @IsInt()
  total_staff: number;

  @IsInt()
  total_customers: number;

  @IsInt()
  active_orders: number;

  @IsNumber()
  revenue_today: number;

  @IsObject()
  weekly_orders: {
    Sunday: number;
    Monday: number;
    Tuesday: number;
    Wednesday: number;
    Thursday: number;
    Friday: number;
    Saturday: number;
  };

  @IsObject()
  orders_by_categories: Record<string, number>;

  @IsArray()
  @IsString({ each: true })
  errors: string[] = [];
}
