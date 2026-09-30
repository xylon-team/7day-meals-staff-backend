export class InventoryDashboardDto {
  total_inventory_items: number;
  total_suppliers: number;
  low_stock_items: number;
  out_of_stock_items: number;
  pending_supplier_requests: number;
  recent_inventory_updates: {
    stock_adjust_id: number;
    adjustment_type: string;
    quantity: number;
    entered_date: Date;
    remarks: string | null;
    inventory: { inventory_id: number; ingredient_name: string };
    staff: { fname: string; lname: string };
  }[];
}
