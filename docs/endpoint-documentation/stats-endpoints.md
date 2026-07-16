# Stats Endpoints

Stats endpoints are defined in `src/stats/stat.controller.ts`.

- **Base path:** `/stats`
- **Authentication:** All routes require `Authorization: Bearer <admin_jwt>` and are protected by `AdminJwtAuthGuard`.

---

## Legend

Parameters are labeled by location:

- **Path** — URL path segment (`:id`)
- **Query** — URL query string (`?key=value`)
- **Body** — JSON request body

---

## Data Models

### AdminDashboardDto

```json
{
  "total_staff": number,
  "total_customers": number,
  "active_orders": number,
  "revenue_today": number,
  "weekly_orders": {
    "Sunday": number,
    "Monday": number,
    "Tuesday": number,
    "Wednesday": number,
    "Thursday": number,
    "Friday": number,
    "Saturday": number
  },
  "orders_by_categories": Record<string, number>,
  "errors": string[]
}
```

---

## Table of Contents

- [1. Get dashboard statistics](#1-get-dashboard-statistics)

---

## Endpoints

### 1. Get dashboard statistics

**Endpoint:** `GET /stats/admin-dashboard`

**Description:** Retrieves comprehensive dashboard statistics including staff count, customer count, active orders, daily revenue, weekly order distribution, and orders grouped by meal plan categories.

**Parameters:** None

**Response:**

```json
{
  "total_staff": 15,
  "total_customers": 234,
  "active_orders": 8,
  "revenue_today": 1250.50,
  "weekly_orders": {
    "Sunday": 12,
    "Monday": 18,
    "Tuesday": 15,
    "Wednesday": 20,
    "Thursday": 14,
    "Friday": 22,
    "Saturday": 10
  },
  "orders_by_categories": {
    "Vegan": 45,
    "Non-Veg": 78,
    "Special Diet": 23
  },
  "errors": []
}
```

**Notes:**
- `total_staff`: Total number of staff members in the system
- `total_customers`: Total number of registered customers
- `active_orders`: Count of orders with status: pending, processing, preparing, or ready
- `revenue_today`: Total revenue from orders placed today (calculated from meal plan prices)
- `weekly_orders`: Order count distribution for the last 7 days, grouped by day of week
- `orders_by_categories`: Order count grouped by meal plan category (e.g., Vegan, Non-Veg, Special Diet)
- `errors`: Array of error messages if any data fetch operations fail (empty array if all successful)

---

## Common Errors

- `401 Unauthorized`: Invalid or missing JWT token in Authorization header.
- `500 Internal Server Error`: Database connection failure or query execution error.
